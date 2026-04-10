const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const cron = require('node-cron');
const app = require('./app');
const pool = require('./config/db');
const { envPath } = require('./config/dbConfig');
const cotizacionService = require('./modules/stk/services/cotizacionService');

const PORT = process.env.PORT || 3001;

async function syncCotizacionesIfNeeded() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { rows } = await pool.query(
      'SELECT 1 FROM stk_cotizacion WHERE "COT_FEC" = $1 LIMIT 1', [today]
    );
    if (rows.length) {
      console.log('[cron] Cotizaciones del día ya existen, omitiendo sync');
      return;
    }
    const result = await cotizacionService.syncFromCambiosChaco();
    console.log(`[cron] Cotizaciones sincronizadas: ${result.detalle.map(d => d.moneda).join(', ')}`);
  } catch (err) {
    console.error('[cron] Error al sincronizar cotizaciones:', err.message || err);
  }
}

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('[db] Conexión a PostgreSQL verificada');
  } catch (err) {
    console.error('[db] No se pudo conectar a PostgreSQL:', err.message);
    console.error(`      Revisa ${envPath} (o DATABASE_URL)`);
    process.exit(1);
  }

  // Sync cotizaciones al iniciar si no hay del día
  syncCotizacionesIfNeeded();

  // Sync diario a las 8:00 AM
  cron.schedule('0 8 * * *', syncCotizacionesIfNeeded);

  app.listen(PORT, () => {
    console.log(`JWF Backend running on http://localhost:${PORT}`);
  });
}

start();
