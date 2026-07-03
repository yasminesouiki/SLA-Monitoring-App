const mysql = require('mysql2');
require('dotenv').config();

// Pool sans database pour pouvoir créer la DB si elle n'existe pas
const bootstrapPool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 1,
}).promise();

bootstrapPool
  .query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'sla_monitoring'}\``)
  .catch((err) => console.error('[db] Could not create database:', err.message));

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'sla_monitoring',
  waitForConnections: true,
  connectionLimit:  10,
}).promise();

module.exports = pool;
