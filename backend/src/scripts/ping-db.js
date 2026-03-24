/**
 * Comprueba la conexión a PostgreSQL. Uso: node src/scripts/ping-db.js
 */

const pool = require('../config/db');

async function ping() {
  try {
    const r = await pool.query('SELECT current_database() AS db, current_user AS user');
    const row = r.rows[0];
    console.log('OK — conectado a PostgreSQL');
    console.log(`  base: ${row.db}, usuario: ${row.user}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

ping();
