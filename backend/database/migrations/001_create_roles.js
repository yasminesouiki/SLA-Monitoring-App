async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id   INT         NOT NULL AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL UNIQUE,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('[migration] roles table ready');
}

module.exports = { up };
