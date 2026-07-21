async function up(db) {
  const columns = [
    { name: 'national_id',      def: 'VARCHAR(50)  DEFAULT NULL' },
    { name: 'phone',            def: 'VARCHAR(30)  DEFAULT NULL' },
    { name: 'address',          def: 'VARCHAR(255) DEFAULT NULL' },
    { name: 'governorate',      def: 'VARCHAR(100) DEFAULT NULL' },
    { name: 'marital_status',   def: 'VARCHAR(50)  DEFAULT NULL' },
    { name: 'children',         def: 'INT          DEFAULT NULL' },
    { name: 'language',         def: 'VARCHAR(255) DEFAULT NULL' },
    { name: 'title',            def: 'VARCHAR(150) DEFAULT NULL' },
    { name: 'assigned_project', def: 'VARCHAR(150) DEFAULT NULL' },
    { name: 'diplomas',         def: 'TEXT         DEFAULT NULL' },
    { name: 'certifications',   def: 'TEXT         DEFAULT NULL' },
    { name: 'skills',           def: 'TEXT         DEFAULT NULL' },
    { name: 'manager',          def: 'VARCHAR(255) DEFAULT NULL' },
    { name: 'hr_manager',       def: 'VARCHAR(255) DEFAULT NULL' },
  ];

  for (const col of columns) {
    const [rows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?`,
      [process.env.DB_NAME, col.name]
    );
    if (rows.length === 0) {
      await db.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def}`);
      console.log(`  + ${col.name}`);
    } else {
      console.log(`  = ${col.name} (already exists)`);
    }
  }

  console.log('[migration] profile fields added to users table');
}

module.exports = { up };
