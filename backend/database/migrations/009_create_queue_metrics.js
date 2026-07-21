async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS queue_metrics (
      id                          INT           NOT NULL AUTO_INCREMENT,
      queue                       VARCHAR(150)  NOT NULL,
      start_interval              DATETIME      NOT NULL,
      end_interval                DATETIME      NOT NULL,
      contacts_abandoned_20s      INT           NULL,
      contacts_abandoned_30s      INT           NULL,
      contacts_abandoned_45s      INT           NULL,
      contacts_abandoned_60s      INT           NULL,
      contacts_abandoned_90s      INT           NULL,
      contacts_abandoned_180s     INT           NULL,
      contacts_answered_20s       INT           NULL,
      contacts_answered_30s       INT           NULL,
      contacts_answered_45s       INT           NULL,
      contacts_answered_60s       INT           NULL,
      contacts_answered_90s       INT           NULL,
      contacts_answered_180s      INT           NULL,
      service_level_60s           DECIMAL(6,2)  NULL,
      service_level_120s          DECIMAL(6,2)  NULL,
      agent_interaction_time      INT           NULL,
      api_contacts                INT           NULL,
      api_contacts_handled        INT           NULL,
      avg_agent_interaction_time  INT           NULL,
      avg_customer_hold_time      INT           NULL,
      avg_handle_time             INT           NULL,
      avg_queue_abandon_time      INT           NULL,
      avg_queue_answer_time       INT           NULL,
      callback_contacts           INT           NULL,
      callback_contacts_handled   INT           NULL,
      contacts_abandoned          INT           NULL,
      contacts_handled_incoming   INT           NULL,
      contacts_handled_outbound   INT           NULL,
      contacts_put_on_hold        INT           NULL,
      contacts_queued             INT           NULL,
      contacts_abandoned_40s      INT           NULL,
      contacts_answered_40s       INT           NULL,
      created_at                  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_queue (queue),
      INDEX idx_start_interval (start_interval),
      UNIQUE KEY uq_queue_interval (queue, start_interval)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('[migration] queue_metrics table ready');
}

module.exports = { up };
