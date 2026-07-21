async function up(db) {
  const columns = [
    { name: 'desk_id', def: 'INT NULL' },
    { name: 'channel',  def: "VARCHAR(20) NULL COMMENT 'call | case | chat'" },
  ];

  for (const col of columns) {
    const [rows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_ratings' AND COLUMN_NAME = ?`,
      [process.env.DB_NAME, col.name]
    );
    if (rows.length === 0) {
      await db.query(`ALTER TABLE user_ratings ADD COLUMN ${col.name} ${col.def}`);
      console.log(`  + ${col.name}`);
    } else {
      console.log(`  = ${col.name} (already exists)`);
    }
  }

  const [[fk]] = await db.query(
    `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_ratings' AND COLUMN_NAME = 'desk_id' AND REFERENCED_TABLE_NAME = 'desks'`,
    [process.env.DB_NAME]
  );
  if (!fk) {
    await db.query(`ALTER TABLE user_ratings ADD CONSTRAINT fk_ratings_desk FOREIGN KEY (desk_id) REFERENCES desks(id)`);
    console.log('  + fk_ratings_desk');
  }

  console.log('[migration] desk_id/channel added to user_ratings table');
}

module.exports = { up };
