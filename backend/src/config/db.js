const { Pool } = require('pg');
const { getPoolConfig } = require('./dbConfig');

const pool = new Pool(getPoolConfig());

pool.on('error', (err) => {
  console.error('[db] Error en el pool de PostgreSQL:', err.message);
});

module.exports = pool;
