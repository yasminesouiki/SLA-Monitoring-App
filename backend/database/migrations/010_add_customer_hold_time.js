async function up(db) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'queue_metrics' AND COLUMN_NAME = 'customer_hold_time'`,
    [process.env.DB_NAME]
  );

  if (rows.length === 0) {
    await db.query(`ALTER TABLE queue_metrics ADD COLUMN customer_hold_time INT NULL AFTER contacts_queued`);
    console.log('  + customer_hold_time');
  } else {
    console.log('  = customer_hold_time (already exists)');
  }

  console.log('[migration] customer_hold_time added to queue_metrics table');
}

module.exports = { up };
