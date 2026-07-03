const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
  const dbName = process.env.DB_NAME || 'sla_monitoring';

  // 1. Créer la base si elle n'existe pas
  const bootstrap = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await bootstrap.end();
  console.log(`[migrate] Database "${dbName}" ready`);

  // 2. Connecter sur la bonne base et lancer les migrations
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
  });

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    // Passe la connexion directement pour éviter que chaque migration
    // n'ouvre son propre pool (qui échouerait si la DB vient d'être créée)
    const { up } = require(path.join(migrationsDir, file));
    await up(db);
  }

  await db.end();
  console.log('[migrate] All migrations applied.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[migrate] Error:', err.message);
  process.exit(1);
});
