async function up(db) {
  const roles = ['agent', 'supervisor'];
  for (const name of roles) {
    await db.query('INSERT IGNORE INTO roles (name) VALUES (?)', [name]);
  }
  console.log('[migration] agent/supervisor roles ready');
}

module.exports = { up };
