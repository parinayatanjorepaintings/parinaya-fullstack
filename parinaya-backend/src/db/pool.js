const { Pool } = require('pg');
require('dotenv').config();

const isNeon = (process.env.DATABASE_URL || '').includes('neon.tech');
const isProd = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (isNeon || isProd)
    ? { rejectUnauthorized: false, sslmode: 'verify-full' }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('DB pool error:', err.message);
});

module.exports = pool;
