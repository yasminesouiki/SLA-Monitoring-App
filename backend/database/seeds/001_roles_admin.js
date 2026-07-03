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

  // Roles
  const roles = ['admin', 'manager', 'technician'];
  for (const name of roles) {
    await db.query('INSERT IGNORE INTO roles (name) VALUES (?)', [name]);
  }
  console.log('[seed] Roles inserted: admin(1), manager(2), technician(3)');

  // Admin user
  const [[existing]] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    ['admin@dxc.com']
  );

  if (!existing) {
    const hashed = await bcrypt.hash('Admin@DXC2026', 10);
    await db.query(
      `INSERT INTO users (employee_id, first_name, last_name, email, password, role_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['DXC-001', 'Admin', 'DXC', 'admin@dxc.com', hashed, 1]
    );
    console.log('[seed] Admin created  →  admin@dxc.com  /  Admin@DXC2026');
  } else {
    console.log('[seed] Admin already exists, skipped');
  }

  await db.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Error:', err.message);
  process.exit(1);
});
