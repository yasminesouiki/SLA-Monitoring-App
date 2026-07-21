async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS realtime_events (
      id                          INT          NOT NULL AUTO_INCREMENT,
      queue_id                    INT          NOT NULL,
      type                        ENUM('handled','abandoned') NOT NULL,
      handle_time_seconds         INT          NULL,
      hold_time_seconds           INT          NULL,
      queue_answer_time_seconds   INT          NULL,
      created_by                  INT          NULL,
      created_at                  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_realtime_queue   FOREIGN KEY (queue_id)   REFERENCES queues(id),
      CONSTRAINT fk_realtime_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('[migration] realtime_events table ready');
}

module.exports = { up };
