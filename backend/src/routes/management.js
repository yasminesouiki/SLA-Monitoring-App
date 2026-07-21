const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
}

router.use(verifyToken, requireAdmin);

// ─── GET /api/management/roles ──────────────────────────────────────────────
router.get('/roles', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM roles ORDER BY name');
    res.json({ roles: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/management/users ─────────────────────────────────────────────
router.post('/users', async (req, res) => {
  const {
    fullName, email, tempPassword, role,
    phone, title, assignedProject, language, manager, hrManager, address,
  } = req.body;

  if (!fullName || !email || !tempPassword || !role) {
    return res.status(400).json({ message: 'Full name, email, temporary password and role are required' });
  }
  if (tempPassword.length < 8) {
    return res.status(400).json({ message: 'Temporary password must be at least 8 characters' });
  }

  try {
    const [[existing]] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const [[roleRow]] = await db.query('SELECT id FROM roles WHERE name = ?', [role]);
    if (!roleRow) return res.status(400).json({ message: 'Unknown role' });

    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    const hashed = await bcrypt.hash(tempPassword, 10);

    await db.query(
      `INSERT INTO users
        (first_name, last_name, email, password, role_id,
         phone, title, assigned_project, language, manager, hr_manager, address, approval_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [firstName, lastName, email, hashed, roleRow.id,
       phone || null, title || null, assignedProject || null, language || null,
       manager || null, hrManager || null, address || null]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/management/desks ───────────────────────────────────────────────
router.get('/desks', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, acronym, languages, call_questions, case_questions, chat_questions
       FROM desks ORDER BY name`
    );
    res.json({ desks: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/management/desks/:id ──────────────────────────────────────────
router.get('/desks/:id', async (req, res) => {
  try {
    const [[desk]] = await db.query('SELECT * FROM desks WHERE id = ?', [req.params.id]);
    if (!desk) return res.status(404).json({ message: 'Desk not found' });
    res.json({ desk });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/management/desks ──────────────────────────────────────────────
router.post('/desks', async (req, res) => {
  const { name, acronym, languages, callQuestions, caseQuestions, chatQuestions } = req.body;

  if (!name || !acronym) {
    return res.status(400).json({ message: 'Desk name and acronym are required' });
  }

  try {
    const [[existing]] = await db.query('SELECT id FROM desks WHERE acronym = ?', [acronym]);
    if (existing) return res.status(409).json({ message: 'A desk with this acronym already exists' });

    await db.query(
      `INSERT INTO desks (name, acronym, languages, call_questions, case_questions, chat_questions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, acronym,
       JSON.stringify(languages || []),
       JSON.stringify(callQuestions || []),
       JSON.stringify(caseQuestions || []),
       JSON.stringify(chatQuestions || [])]
    );

    res.status(201).json({ message: 'Desk created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PUT /api/management/desks/:id ──────────────────────────────────────────
router.put('/desks/:id', async (req, res) => {
  const { name, acronym, languages, callQuestions, caseQuestions, chatQuestions } = req.body;

  if (!name || !acronym) {
    return res.status(400).json({ message: 'Desk name and acronym are required' });
  }

  try {
    const [[existing]] = await db.query(
      'SELECT id FROM desks WHERE acronym = ? AND id != ?', [acronym, req.params.id]
    );
    if (existing) return res.status(409).json({ message: 'A desk with this acronym already exists' });

    const [result] = await db.query(
      `UPDATE desks SET name=?, acronym=?, languages=?, call_questions=?, case_questions=?, chat_questions=?
       WHERE id=?`,
      [name, acronym,
       JSON.stringify(languages || []),
       JSON.stringify(callQuestions || []),
       JSON.stringify(caseQuestions || []),
       JSON.stringify(chatQuestions || []),
       req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Desk not found' });
    res.json({ message: 'Desk updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/management/approvals?status=pending ───────────────────────────
router.get('/approvals', async (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status)
    ? req.query.status
    : 'pending';

  try {
    const excludeAdmin = status === 'approved' ? "AND r.name != 'admin'" : "";
    const [rows] = await db.query(
      `SELECT u.id, u.employee_id, u.first_name, u.last_name, u.email,
              u.phone, u.title, u.assigned_project, u.created_at,
              r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.approval_status = ? ${excludeAdmin}
       ORDER BY u.created_at DESC`,
      [status]
    );
    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PUT /api/management/approvals/:id/approve ──────────────────────────────
router.put('/approvals/:id/approve', async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE users SET approval_status = 'approved' WHERE id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User approved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PUT /api/management/approvals/:id/reject ───────────────────────────────
router.put('/approvals/:id/reject', async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE users SET approval_status = 'rejected' WHERE id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User rejected successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
