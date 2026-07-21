const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
}

router.use(verifyToken, requireAdmin);

const CHANNEL_COLUMNS = { call: 'call_questions', case: 'case_questions', chat: 'chat_questions' };

// A question can be a legacy plain string (old desks) or an object { text, weight, isEliminator }.
function normalizeQuestion(q) {
  if (typeof q === 'string') return { text: q, weight: 1, isEliminator: false };
  return { text: q.text || '', weight: Number(q.weight) > 0 ? Number(q.weight) : 1, isEliminator: !!q.isEliminator };
}

// ─── GET /api/ratings/search-users?q=... ────────────────────────────────────
router.get('/search-users', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ users: [] });

  try {
    const like = `%${q}%`;
    const [rows] = await db.query(
      `SELECT id, employee_id, first_name, last_name, email
       FROM users
       WHERE (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_id LIKE ?)
         AND is_active = 1
       ORDER BY first_name LIMIT 10`,
      [like, like, like, like]
    );
    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/ratings/desk-questions/:deskId/:channel ───────────────────────
router.get('/desk-questions/:deskId/:channel', async (req, res) => {
  const { deskId, channel } = req.params;
  const column = CHANNEL_COLUMNS[channel];
  if (!column) return res.status(400).json({ message: 'Invalid channel' });

  try {
    const [[desk]] = await db.query(`SELECT id, name, ${column} AS raw FROM desks WHERE id = ?`, [deskId]);
    if (!desk) return res.status(404).json({ message: 'Desk not found' });

    const raw = typeof desk.raw === 'string' ? JSON.parse(desk.raw || '[]') : (desk.raw || []);
    const questions = raw.map(normalizeQuestion).filter(q => q.text.trim());

    res.json({ deskName: desk.name, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/ratings ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { userId, deskId, channel, answers, comment } = req.body;
  const column = CHANNEL_COLUMNS[channel];

  if (!userId || !deskId || !column || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: 'User, desk, channel and answers are required' });
  }

  try {
    const [[user]] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [[desk]] = await db.query(`SELECT id, name, ${column} AS raw FROM desks WHERE id = ?`, [deskId]);
    if (!desk) return res.status(404).json({ message: 'Desk not found' });

    const raw = typeof desk.raw === 'string' ? JSON.parse(desk.raw || '[]') : (desk.raw || []);
    const questions = raw.map(normalizeQuestion).filter(q => q.text.trim());

    if (answers.length !== questions.length) {
      return res.status(400).json({ message: 'Answers do not match this desk\'s question set' });
    }
    if (!answers.every(a => a === 'yes' || a === 'no')) {
      return res.status(400).json({ message: 'Each answer must be "yes" or "no"' });
    }

    const eliminated = questions.some((q, i) => q.isEliminator && answers[i] === 'no');
    const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0);
    const earnedWeight = questions.reduce((sum, q, i) => sum + (answers[i] === 'yes' ? q.weight : 0), 0);
    const score = (eliminated || totalWeight === 0) ? 0 : Math.round((earnedWeight / totalWeight) * 100);

    const storedAnswers = questions.map((q, i) => ({
      text: q.text,
      weight: q.weight,
      isEliminator: q.isEliminator,
      answer: answers[i],
    }));

    const [result] = await db.query(
      `INSERT INTO user_ratings (user_id, rater_id, desk_id, channel, answers, eliminated, score, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, req.user.id, deskId, channel, JSON.stringify(storedAnswers), eliminated ? 1 : 0, score, comment || null]
    );

    res.status(201).json({
      message: 'Rating saved successfully',
      rating: { id: result.insertId, userId, deskId, channel, eliminated, score },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/ratings/user/:userId ──────────────────────────────────────────
router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.answers, r.eliminated, r.score, r.comment, r.created_at, r.channel,
              d.name AS desk_name,
              rater.first_name AS rater_first_name, rater.last_name AS rater_last_name
       FROM user_ratings r
       JOIN users rater ON rater.id = r.rater_id
       LEFT JOIN desks d ON d.id = r.desk_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.userId]
    );
    res.json({ ratings: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
