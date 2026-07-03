async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id           INT          NOT NULL AUTO_INCREMENT,
      employee_id  VARCHAR(50)  UNIQUE COMMENT 'DXC employee badge ID',
      first_name   VARCHAR(100) NOT NULL,
      last_name    VARCHAR(100) NOT NULL,
      email        VARCHAR(255) NOT NULL UNIQUE,
      password     VARCHAR(255) NOT NULL,
      role_id      INT          NOT NULL DEFAULT 3,
      is_active    TINYINT(1)   NOT NULL DEFAULT 1,
      created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('[migration] users table ready');
}

module.exports = { up };
