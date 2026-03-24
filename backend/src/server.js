const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = require('./app');
const pool = require('./config/db');
const { envPath } = require('./config/dbConfig');

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('[db] Conexión a PostgreSQL verificada');
  } catch (err) {
    console.error('[db] No se pudo conectar a PostgreSQL:', err.message);
    console.error(`      Revisa ${envPath} (o DATABASE_URL)`);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`JWF Backend running on http://localhost:${PORT}`);
  });
}

start();
