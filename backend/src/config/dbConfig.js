const path = require('path');

const envPath = path.join(__dirname, '..', '..', '.env');
require('dotenv').config({ path: envPath });

/**
 * Opciones de conexión reutilizables (p. ej. scripts que hacen pool.end()).
 * Prioridad: DATABASE_URL; si no, DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME.
 */
function getPoolConfig() {
  const ssl =
    process.env.DB_SSL === 'true' || process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
      : undefined;

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ...(ssl ? { ssl } : {}),
    };
  }

  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  return {
    host,
    port,
    user,
    password,
    database,
    ...(ssl ? { ssl } : {}),
  };
}

module.exports = { getPoolConfig, envPath };
