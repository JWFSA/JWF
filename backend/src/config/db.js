const { Pool } = require('pg');
const { getPoolConfig } = require('./dbConfig');

const poolConfig = getPoolConfig();
poolConfig.options = '-c search_path="ERP",auth,public';

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[db] Error en el pool de PostgreSQL:', err.message);
});

module.exports = pool;
