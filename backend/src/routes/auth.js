const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { sendOTPEmail } = require('../services/mailer');

// OTP store: { email -> { code, expiresAt, userData } }
const otpStore = new Map();

const ADMIN_SECURITY_EMAIL = 'yasminesouikiii@gmail.com';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, id: employee_id, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'First name, last name, email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (employee_id, first_name, last_name, email, password, role_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_id || null, firstName, lastName, email, hashedPassword, 3]
    );

    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT users.*, roles.name AS role
       FROM users
       JOIN roles ON users.role_id = roles.id
       WHERE users.email = ? AND users.is_active = 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/auth/me  (protégé) ────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT users.id, employee_id, first_name, last_name, email, roles.name AS role
       FROM users
       JOIN roles ON users.role_id = roles.id
       WHERE users.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/auth/logout  (protégé) ───────────────────────────────────────
router.post('/logout', verifyToken, (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// ─── POST /api/auth/admin-login ─────────────────────────────────────────────
// Vérifie les credentials admin puis envoie un OTP à l'email de sécurité
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT users.*, roles.name AS role
       FROM users
       JOIN roles ON users.role_id = roles.id
       WHERE users.email = ? AND users.is_active = 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    const code = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, {
      code,
      expiresAt,
      userData: {
        id: user.id,
        employee_id: user.employee_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });

    await sendOTPEmail(ADMIN_SECURITY_EMAIL, code);

    res.json({ message: 'OTP sent', sentTo: ADMIN_SECURITY_EMAIL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/auth/verify-otp ──────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  const entry = otpStore.get(email);

  if (!entry) {
    return res.status(400).json({ message: 'No OTP requested for this email' });
  }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP expired, please try again' });
  }
  if (entry.code !== code.trim()) {
    return res.status(400).json({ message: 'Invalid code' });
  }

  otpStore.delete(email);

  const token = jwt.sign(
    { id: entry.userData.id, email: entry.userData.email, role: entry.userData.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );

  res.json({ message: 'Access granted', token, user: entry.userData });
});

module.exports = router;
