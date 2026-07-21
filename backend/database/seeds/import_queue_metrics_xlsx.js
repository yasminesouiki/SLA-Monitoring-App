const mysql = require('mysql2/promise');
const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Usage: node database/seeds/import_queue_metrics_xlsx.js "<path to xlsx>" ["<sheet name>"]
// Note: "DB all queues.xlsx" ships two sheets with the exact same data, one with a
// combined StartInterval/EndInterval column, the other split into Date/Time columns.
// Only the first sheet (ISO datetimes) is imported to avoid duplicating every row.
const filePath = process.argv[2];
const sheetName = process.argv[3] || 'Historical Metrics Report';

if (!filePath) {
  console.error('[import] Usage: node import_queue_metrics_xlsx.js "<path to xlsx>"');
  process.exit(1);
}

// This file's column order (fixed, verified against its header row).
const COLUMNS = [
  'queue', 'start_interval', 'end_interval',
  'contacts_abandoned_20s', 'contacts_abandoned_30s', 'contacts_abandoned_45s',
  'contacts_abandoned_60s', 'contacts_abandoned_180s',
  'contacts_answered_20s', 'contacts_answered_30s', 'contacts_answered_45s',
  'contacts_answered_60s', 'contacts_answered_180s',
  'service_level_60s', 'service_level_120s',
  'agent_interaction_time', 'api_contacts', 'api_contacts_handled',
  'avg_agent_interaction_time', 'avg_handle_time',
  'avg_queue_abandon_time', 'avg_queue_answer_time',
  'callback_contacts', 'callback_contacts_handled',
  'contacts_abandoned', 'contacts_handled_incoming', 'contacts_handled_outbound',
  'contacts_queued', 'customer_hold_time',
  'contacts_abandoned_40s', 'contacts_answered_40s',
];

function parseValue(raw, col) {
  if (raw === undefined || raw === '') return null;
  if (col === 'queue') return raw;
  if (col === 'start_interval' || col === 'end_interval') {
    return raw.replace('T', ' ').slice(0, 19);
  }
  if (col === 'service_level_60s' || col === 'service_level_120s') {
    return parseFloat(raw.replace('%', ''));
  }
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

async function run() {
  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets[sheetName];
  if (!sheet) {
    console.error(`[import] Sheet "${sheetName}" not found. Available: ${wb.SheetNames.join(', ')}`);
    process.exit(1);
  }

  const json = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
  const [header, ...rows] = json;

  console.log(`[import] ${rows.length} rows found, columns: ${header.length}`);

  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'sla_monitoring',
  });

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const values = [];
    const placeholders = [];

    for (const cells of batch) {
      const rowValues = COLUMNS.map((col, idx) => parseValue(cells[idx], col));
      values.push(...rowValues);
      placeholders.push(`(${COLUMNS.map(() => '?').join(', ')})`);
    }

    const sql = `
      INSERT IGNORE INTO queue_metrics (${COLUMNS.join(', ')})
      VALUES ${placeholders.join(', ')}
    `;
    await db.query(sql, values);
    inserted += batch.length;
    process.stdout.write(`\r[import] ${inserted}/${rows.length} rows processed`);
  }

  console.log(`\n[import] Done. ${inserted} rows processed (duplicates on queue+start_interval were skipped).`);
  await db.end();
  process.exit(0);
}

run().catch((err) => {
  console.error('[import] Error:', err.message);
  process.exit(1);
});
