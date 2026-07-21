async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS queues (
      id                 INT           NOT NULL AUTO_INCREMENT,
      name               VARCHAR(150)  NOT NULL UNIQUE,
      client_group       VARCHAR(100)  NOT NULL DEFAULT 'Other',
      target_percentage  DECIMAL(5,2)  NOT NULL DEFAULT 90.00,
      created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('[migration] queues table ready');

  // Heuristic group name: first token, but keep short ALL-CAPS prefixes (EL, GF, RN...)
  // paired with the following word since they are not meaningful alone.
  function guessGroup(name) {
    const parts = name.replace(/_/g, ' ').trim().split(/\s+/);
    if (parts[0].length <= 2 && parts[0] === parts[0].toUpperCase() && parts[1]) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0];
  }

  const [distinctQueues] = await db.query('SELECT DISTINCT queue FROM queue_metrics');
  for (const row of distinctQueues) {
    await db.query(
      'INSERT IGNORE INTO queues (name, client_group) VALUES (?, ?)',
      [row.queue, guessGroup(row.queue)]
    );
  }
  console.log(`[migration] ${distinctQueues.length} queues synced from queue_metrics`);
}

module.exports = { up };
