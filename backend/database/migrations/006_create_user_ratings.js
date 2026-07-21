async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_ratings (
      id           INT          NOT NULL AUTO_INCREMENT,
      user_id      INT          NOT NULL COMMENT 'Rated user',
      rater_id     INT          NOT NULL COMMENT 'Admin who performed the rating',
      answers      JSON         NOT NULL,
      eliminated   TINYINT(1)   NOT NULL DEFAULT 0,
      score        INT          NOT NULL DEFAULT 0,
      comment      TEXT         NULL,
      created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_ratings_user  FOREIGN KEY (user_id)  REFERENCES users(id),
      CONSTRAINT fk_ratings_rater FOREIGN KEY (rater_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('[migration] user_ratings table ready');
}

module.exports = { up };
