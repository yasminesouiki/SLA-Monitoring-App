const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Usage: node database/seeds/import_queue_metrics.js "<path to csv>"
const filePath = process.argv[2] || 'D:\\DXC technology internship\\Historical Metrics Report - Final.csv';

const COLUMNS = [
  'queue', 'start_interval', 'end_interval',
  'contacts_abandoned_20s', 'contacts_abandoned_30s', 'contacts_abandoned_45s',
  'contacts_abandoned_60s', 'contacts_abandoned_90s', 'contacts_abandoned_180s',
  'contacts_answered_20s', 'contacts_answered_30s', 'contacts_answered_45s',
  'contacts_answered_60s', 'contacts_answered_90s', 'contacts_answered_180s',
  'service_level_60s', 'service_level_120s',
  'agent_interaction_time', 'api_contacts', 'api_contacts_handled',
  'avg_agent_interaction_time', 'avg_customer_hold_time', 'avg_handle_time',
  'avg_queue_abandon_time', 'avg_queue_answer_time',
  'callback_contacts', 'callback_contacts_handled',
  'contacts_abandoned', 'contacts_handled_incoming', 'contacts_handled_outbound',
  'contacts_put_on_hold', 'contacts_queued',
  'contacts_abandoned_40s', 'contacts_answered_40s',
];

function parseValue(raw, col) {
  if (raw === undefined || raw === '') return null;
  if (col === 'queue') return raw;
  if (col === 'start_interval' || col === 'end_interval') {
    // e.g. 2026-02-02T11:00:00.000+01:00 -> MySQL DATETIME (UTC-naive, keep local wall-clock)
    return raw.replace('T', ' ').slice(0, 19);
  }
  if (col === 'service_level_60s' || col === 'service_level_120s') {
    return parseFloat(raw.replace('%', ''));
  }
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

async function run() {
  if (!fs.existsSync(filePath)) {
    console.error(`[import] File not found: ${filePath}`);
    process.exit(1);
  }

  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'sla_monitoring',
  });

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(l => l.trim());
  const [header, ...rows] = lines;

  console.log(`[import] ${rows.length} rows found, columns: ${header.split(',').length}`);

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const values = [];
    const placeholders = [];

    for (const line of batch) {
      const cells = line.split(',');
      const values_row = COLUMNS.map((col, idx) => parseValue(cells[idx], col));
      values.push(...values_row);
      placeholders.push(`(${COLUMNS.map(() => '?').join(', ')})`);
    }

    const sql = `
      INSERT INTO queue_metrics (${COLUMNS.join(', ')})
      VALUES ${placeholders.join(', ')}
      ON DUPLICATE KEY UPDATE contacts_queued = VALUES(contacts_queued)
    `;
    await db.query(sql, values);
    inserted += batch.length;
    process.stdout.write(`\r[import] ${inserted}/${rows.length} rows processed`);
  }

  console.log(`\n[import] Done. ${inserted} rows imported into queue_metrics.`);
  await db.end();
  process.exit(0);
}

run().catch((err) => {
  console.error('[import] Error:', err.message);
  process.exit(1);
});
