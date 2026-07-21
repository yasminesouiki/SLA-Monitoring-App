const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
}

// Toutes les routes du dashboard nécessitent d'être connecté ; seules les
// routes de gestion (créer/modifier des queues, importer, écrire des events
// temps réel) sont réservées à l'admin — la lecture (overview) est ouverte
// à tout utilisateur approuvé.
router.use(verifyToken);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const MIN_SAMPLE_FOR_EXTREMES = 10; // ignore near-empty queues when crowning "best/fastest/shortest"

function guessGroup(name) {
  const parts = name.replace(/_/g, ' ').trim().split(/\s+/);
  if (parts[0].length <= 2 && parts[0] === parts[0].toUpperCase() && parts[1]) {
    return `${parts[0]} ${parts[1]}`;
  }
  return parts[0];
}

function round1(n) { return Math.round(n * 10) / 10; }
function pct(part, total) { return total > 0 ? round1((part / total) * 100) : 0; }

const CATEGORY_COLORS = ['#4f46e5', '#f97316', '#3b82f6', '#14b8a6', '#a855f7', '#f59e0b'];
const OTHER_COLOR = '#9ca3af';

/**
 * rows: [{ queue, group, offered, handled, abandoned, avgAnswer, avgHandle, avgHold, target }]
 * trend (optional): [{ period, handled, abandoned }]
 */
function buildOverview(rows, trend = [], minSample = MIN_SAMPLE_FOR_EXTREMES) {
  const totalOffered = rows.reduce((s, r) => s + r.offered, 0);
  const totalHandled = rows.reduce((s, r) => s + r.handled, 0);
  const totalAbandoned = rows.reduce((s, r) => s + r.abandoned, 0);

  const eligible = rows.filter(r => r.offered >= minSample);

  const pickBest = (list, valueFn, better) => {
    let best = null;
    for (const r of list) {
      const v = valueFn(r);
      if (v === null || v === undefined || Number.isNaN(v)) continue;
      if (!best || better(v, best.value)) best = { value: v, label: r.queue };
    }
    return best;
  };

  const bestAnswerRate = pickBest(eligible, r => pct(r.handled, r.offered), (a, b) => a > b) || { value: 0, label: '—' };
  const fastestResponse = pickBest(eligible, r => r.avgAnswer, (a, b) => a < b) || { value: null, label: '—' };
  const bestEfficiency = pickBest(eligible, r => r.avgHandle, (a, b) => a < b) || { value: null, label: '—' };
  const shortestHold = pickBest(eligible, r => r.avgHold, (a, b) => a < b) || { value: null, label: '—' };

  const groupTotals = {};
  for (const r of rows) {
    groupTotals[r.group] = groupTotals[r.group] || { offered: 0, handled: 0, abandoned: 0 };
    groupTotals[r.group].offered += r.offered;
    groupTotals[r.group].handled += r.handled;
    groupTotals[r.group].abandoned += r.abandoned;
  }
  let highestVolume = { value: 0, label: '—' };
  for (const [group, t] of Object.entries(groupTotals)) {
    if (t.offered > highestVolume.value) highestVolume = { value: t.offered, label: group };
  }

  const volumeByGroupSorted = Object.entries(groupTotals)
    .map(([group, t]) => ({ label: group, value: t.offered }))
    .sort((a, b) => b.value - a.value);
  const top = volumeByGroupSorted.slice(0, 6);
  const restSum = volumeByGroupSorted.slice(6).reduce((s, g) => s + g.value, 0);
  const volumeByGroup = [
    ...top.map((g, i) => ({ ...g, pct: pct(g.value, totalOffered), color: CATEGORY_COLORS[i] })),
    ...(restSum > 0 ? [{ label: 'Other', value: restSum, pct: pct(restSum, totalOffered), color: OTHER_COLOR }] : []),
  ];

  const handledVsAbandoned = [
    { label: 'Handled', value: totalHandled, pct: pct(totalHandled, totalOffered), color: '#4f46e5' },
    { label: 'Abandoned', value: totalAbandoned, pct: pct(totalAbandoned, totalOffered), color: '#f97316' },
  ];

  const groupsMap = {};
  for (const r of rows) {
    groupsMap[r.group] = groupsMap[r.group] || { group: r.group, offered: 0, handled: 0, abandoned: 0, desks: [] };
    const g = groupsMap[r.group];
    g.offered += r.offered;
    g.handled += r.handled;
    g.abandoned += r.abandoned;
    const answerRate = pct(r.handled, r.offered);
    const abandonRate = pct(r.abandoned, r.offered);
    g.desks.push({
      queue: r.queue,
      offered: r.offered,
      handled: r.handled,
      abandoned: r.abandoned,
      answerRate,
      abandonRate,
      target: r.target,
      status: r.offered === 0 ? 'no_data' : (answerRate >= r.target ? 'on_target' : 'below_target'),
      asaSeconds: r.avgAnswer,
      ahtSeconds: r.avgHandle,
      holdSeconds: r.avgHold,
    });
  }
  const groups = Object.values(groupsMap)
    .map(g => {
      const answerRate = pct(g.handled, g.offered);
      const groupTarget = g.desks.length ? round1(g.desks.reduce((s, d) => s + d.target, 0) / g.desks.length) : 90;
      return {
        ...g,
        answerRate,
        target: groupTarget,
        status: g.offered === 0 ? 'no_data' : (answerRate >= groupTarget ? 'on_target' : 'below_target'),
        desks: g.desks.sort((a, b) => b.offered - a.offered),
      };
    })
    .sort((a, b) => b.offered - a.offered);

  return {
    summary: {
      totalOffered, totalHandled, totalAbandoned,
      bestAnswerRate, highestVolume, fastestResponse, bestEfficiency, shortestHold,
    },
    donuts: { handledVsAbandoned, volumeByGroup },
    trend,
    groups,
  };
}

async function fetchQueueRows() {
  const [rows] = await db.query(`
    SELECT qm.queue AS queue,
           COALESCE(q.client_group, 'Other') AS \`group\`,
           COALESCE(q.target_percentage, 90) AS target,
           SUM(qm.contacts_queued) AS offered,
           SUM(qm.contacts_handled_incoming) AS handled,
           SUM(qm.contacts_abandoned) AS abandoned,
           AVG(NULLIF(qm.avg_queue_answer_time, 0)) AS avgAnswer,
           AVG(NULLIF(qm.avg_handle_time, 0)) AS avgHandle,
           AVG(NULLIF(COALESCE(qm.avg_customer_hold_time, qm.customer_hold_time), 0)) AS avgHold
    FROM queue_metrics qm
    LEFT JOIN queues q ON q.name = qm.queue
    GROUP BY qm.queue, \`group\`, target
  `);
  return rows.map(r => ({
    queue: r.queue,
    group: r.group,
    target: Number(r.target),
    offered: Number(r.offered) || 0,
    handled: Number(r.handled) || 0,
    abandoned: Number(r.abandoned) || 0,
    avgAnswer: r.avgAnswer !== null ? Number(r.avgAnswer) : null,
    avgHandle: r.avgHandle !== null ? Number(r.avgHandle) : null,
    avgHold: r.avgHold !== null ? Number(r.avgHold) : null,
  }));
}

async function fetchTrend() {
  const [rows] = await db.query(`
    SELECT DATE_FORMAT(start_interval, '%Y-%m') AS period,
           SUM(contacts_handled_incoming) AS handled,
           SUM(contacts_abandoned) AS abandoned
    FROM queue_metrics
    GROUP BY period
    ORDER BY period
  `);
  return rows.map(r => ({ period: r.period, handled: Number(r.handled) || 0, abandoned: Number(r.abandoned) || 0 }));
}

// ─── GET /api/dashboard/historical/overview ──────────────────────────────────
router.get('/historical/overview', async (_req, res) => {
  try {
    const [rows, trend] = await Promise.all([fetchQueueRows(), fetchTrend()]);
    res.json(buildOverview(rows, trend));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

async function fetchRealtimeRows() {
  const [rows] = await db.query(`
    SELECT q.name AS queue, q.client_group AS \`group\`, q.target_percentage AS target,
           COUNT(CASE WHEN e.type = 'handled' THEN 1 END) AS handled,
           COUNT(CASE WHEN e.type = 'abandoned' THEN 1 END) AS abandoned,
           AVG(NULLIF(e.queue_answer_time_seconds, 0)) AS avgAnswer,
           AVG(NULLIF(e.handle_time_seconds, 0)) AS avgHandle,
           AVG(NULLIF(e.hold_time_seconds, 0)) AS avgHold
    FROM queues q
    LEFT JOIN realtime_events e ON e.queue_id = q.id
    GROUP BY q.id, q.name, q.client_group, q.target_percentage
  `);
  return rows.map(r => {
    const handled = Number(r.handled) || 0;
    const abandoned = Number(r.abandoned) || 0;
    return {
      queue: r.queue,
      group: r.group,
      target: Number(r.target),
      offered: handled + abandoned,
      handled,
      abandoned,
      avgAnswer: r.avgAnswer !== null ? Number(r.avgAnswer) : null,
      avgHandle: r.avgHandle !== null ? Number(r.avgHandle) : null,
      avgHold: r.avgHold !== null ? Number(r.avgHold) : null,
    };
  });
}

// ─── GET /api/dashboard/realtime/overview ────────────────────────────────────
router.get('/realtime/overview', async (_req, res) => {
  try {
    const rows = await fetchRealtimeRows();
    res.json(buildOverview(rows, [], 1));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/dashboard/realtime/events ─────────────────────────────────────
router.post('/realtime/events', requireAdmin, async (req, res) => {
  const { queueId, type, handleTimeSeconds, holdTimeSeconds, queueAnswerTimeSeconds } = req.body;
  if (!queueId || (type !== 'handled' && type !== 'abandoned')) {
    return res.status(400).json({ message: 'A queue and a valid type (handled/abandoned) are required' });
  }
  try {
    const [[queue]] = await db.query('SELECT id FROM queues WHERE id = ?', [queueId]);
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    await db.query(
      `INSERT INTO realtime_events (queue_id, type, handle_time_seconds, hold_time_seconds, queue_answer_time_seconds, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [queueId, type, handleTimeSeconds || null, holdTimeSeconds || null, queueAnswerTimeSeconds || null, req.user.id]
    );
    res.status(201).json({ message: 'Event recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/dashboard/realtime/reset ──────────────────────────────────────
router.post('/realtime/reset', requireAdmin, async (_req, res) => {
  try {
    await db.query('DELETE FROM realtime_events');
    res.json({ message: 'Real-time counters reset' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/dashboard/queues ────────────────────────────────────────────────
router.get('/queues', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, client_group, target_percentage FROM queues ORDER BY client_group, name`
    );
    res.json({ queues: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/dashboard/queues ───────────────────────────────────────────────
router.post('/queues', requireAdmin, async (req, res) => {
  const { name, clientGroup, targetPercentage } = req.body;
  if (!name) return res.status(400).json({ message: 'Queue name is required' });
  try {
    const [[existing]] = await db.query('SELECT id FROM queues WHERE name = ?', [name]);
    if (existing) return res.status(409).json({ message: 'A queue with this name already exists' });

    await db.query(
      'INSERT INTO queues (name, client_group, target_percentage) VALUES (?, ?, ?)',
      [name, clientGroup || guessGroup(name), targetPercentage || 90]
    );
    res.status(201).json({ message: 'Queue created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PUT /api/dashboard/queues/:id ────────────────────────────────────────────
router.put('/queues/:id', requireAdmin, async (req, res) => {
  const { clientGroup, targetPercentage } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE queues SET client_group = COALESCE(?, client_group), target_percentage = COALESCE(?, target_percentage) WHERE id = ?',
      [clientGroup || null, targetPercentage || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Queue not found' });
    res.json({ message: 'Queue updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/dashboard/import (CSV or XLSX historical file) ───────────────
const HEADER_MAP = {
  'queue': 'queue',
  'startinterval': 'start_interval',
  'endinterval': 'end_interval',
  'contacts abandoned in 20 seconds': 'contacts_abandoned_20s',
  'contacts abandoned in 30 seconds': 'contacts_abandoned_30s',
  'contacts abandoned in 45 seconds': 'contacts_abandoned_45s',
  'contacts abandoned in 60 seconds': 'contacts_abandoned_60s',
  'contacts abandoned in 90 seconds': 'contacts_abandoned_90s',
  'contacts abandoned in 180 seconds': 'contacts_abandoned_180s',
  'contacts answered in 20 seconds': 'contacts_answered_20s',
  'contacts answered in 30 seconds': 'contacts_answered_30s',
  'contacts answered in 45 seconds': 'contacts_answered_45s',
  'contacts answered in 60 seconds': 'contacts_answered_60s',
  'contacts answered in 90 seconds': 'contacts_answered_90s',
  'contacts answered in 180 seconds': 'contacts_answered_180s',
  'service level 60 seconds': 'service_level_60s',
  'service level 120 seconds': 'service_level_120s',
  'agent interaction time': 'agent_interaction_time',
  'api contacts': 'api_contacts',
  'api contacts handled': 'api_contacts_handled',
  'average agent interaction time': 'avg_agent_interaction_time',
  'average customer hold time': 'avg_customer_hold_time',
  'customer hold time': 'customer_hold_time',
  'average handle time': 'avg_handle_time',
  'average queue abandon time': 'avg_queue_abandon_time',
  'average queue answer time': 'avg_queue_answer_time',
  'callback contacts': 'callback_contacts',
  'callback contacts handled': 'callback_contacts_handled',
  'contacts abandoned': 'contacts_abandoned',
  'contacts handled incoming': 'contacts_handled_incoming',
  'contacts handled outbound': 'contacts_handled_outbound',
  'contacts put on hold': 'contacts_put_on_hold',
  'contacts queued': 'contacts_queued',
  'contacts abandoned 40 seconds': 'contacts_abandoned_40s',
  'contacts answered 40 seconds': 'contacts_answered_40s',
};

function parseCell(raw, col) {
  if (raw === undefined || raw === null || raw === '') return null;
  const s = String(raw).trim();
  if (s === '') return null;
  if (col === 'queue') return s;
  if (col === 'start_interval' || col === 'end_interval') return s.replace('T', ' ').slice(0, 19);
  if (col === 'service_level_60s' || col === 'service_level_120s') return parseFloat(s.replace('%', ''));
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

router.post('/import', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    let header, dataRows;
    const isExcel = /\.xlsx?$/i.test(req.file.originalname);

    if (isExcel) {
      const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
      [header, ...dataRows] = json;
    } else {
      const text = req.file.buffer.toString('utf8');
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      header = lines[0].split(',');
      dataRows = lines.slice(1).map(l => l.split(','));
    }

    const colByIndex = header.map(h => HEADER_MAP[String(h).trim().toLowerCase()] || null);
    const insertCols = [...new Set(colByIndex.filter(Boolean))];
    if (!insertCols.includes('queue') || !insertCols.includes('start_interval')) {
      return res.status(400).json({ message: 'Unrecognized file format: missing Queue/StartInterval columns' });
    }

    const BATCH_SIZE = 500;
    let imported = 0;
    const queueNames = new Set();

    for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
      const batch = dataRows.slice(i, i + BATCH_SIZE).filter(r => r && r.length && r.some(c => c !== ''));
      if (batch.length === 0) continue;

      const values = [];
      const placeholders = [];
      for (const cells of batch) {
        const rowObj = {};
        colByIndex.forEach((col, idx) => { if (col) rowObj[col] = parseCell(cells[idx], col); });
        if (!rowObj.queue || !rowObj.start_interval) continue;
        queueNames.add(rowObj.queue);

        values.push(...insertCols.map(c => rowObj[c] ?? null));
        placeholders.push(`(${insertCols.map(() => '?').join(', ')})`);
      }
      if (placeholders.length === 0) continue;

      await db.query(
        `INSERT IGNORE INTO queue_metrics (${insertCols.join(', ')}) VALUES ${placeholders.join(', ')}`,
        values
      );
      imported += placeholders.length;
    }

    for (const name of queueNames) {
      await db.query('INSERT IGNORE INTO queues (name, client_group) VALUES (?, ?)', [name, guessGroup(name)]);
    }

    res.json({ message: `Import complete: ${imported} rows processed, ${queueNames.size} queues detected.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to import file: ' + err.message });
  }
});

module.exports = router;
