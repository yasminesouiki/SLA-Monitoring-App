async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS desks (
      id              INT          NOT NULL AUTO_INCREMENT,
      name            VARCHAR(150) NOT NULL,
      acronym         VARCHAR(20)  NOT NULL UNIQUE,
      languages       JSON         NULL,
      call_questions  JSON         NULL,
      case_questions  JSON         NULL,
      chat_questions  JSON         NULL,
      created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('[migration] desks table ready');
}

module.exports = { up };
