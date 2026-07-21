async function up(db) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'approval_status'`,
    [process.env.DB_NAME]
  );

  if (rows.length === 0) {
    // Default 'approved' so existing/admin-created accounts keep working;
    // the self-registration route explicitly inserts 'pending' for new sign-ups.
    await db.query(
      `ALTER TABLE users ADD COLUMN approval_status ENUM('pending','approved','rejected')
       NOT NULL DEFAULT 'approved'`
    );
    console.log('  + approval_status');
  } else {
    console.log('  = approval_status (already exists)');
  }

  console.log('[migration] approval_status added to users table');
}

module.exports = { up };
