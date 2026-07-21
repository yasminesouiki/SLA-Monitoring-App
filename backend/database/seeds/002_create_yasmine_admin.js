const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function seed() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'sla_monitoring',
  });

  const email = 'yasminesouikiii@gmail.com';

  const [[existing]] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (!existing) {
    const hashed = await bcrypt.hash('Admin@2026', 10);
    await db.query(
      `INSERT INTO users (employee_id, first_name, last_name, email, password, role_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['DXC-YAS', 'Yasmine', 'Souiki', email, hashed, 1]
    );
    console.log('[seed] Admin créé →  yasminesouikiii@gmail.com  /  Admin@2026');
  } else {
    console.log('[seed] Compte existe déjà, skipped');
  }

  await db.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Error:', err.message);
  process.exit(1);
});
