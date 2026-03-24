/**
 * Script para crear el primer usuario administrador.
 * Uso: node src/scripts/seed-admin.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { getPoolConfig } = require('../config/dbConfig');

const pool = new Pool(getPoolConfig());

const ADMIN = {
  codigo: 1,
  nombre: 'Administrador',
  apellido: 'Sistema',
  login: 'admin',
  password: 'admin123',
  descAbrev: 'ADM',
  empresa: 1,
  sucursal: 1,
};

async function seed() {
  const client = await pool.connect();
  try {
    const hash = await bcrypt.hash(ADMIN.password, 10);

    await client.query('BEGIN');

    // Insertar o actualizar operador admin
    await client.query(
      `INSERT INTO "GEN_OPERADOR" (
         "OPER_CODIGO", "OPER_NOMBRE", "OPER_APELLIDO", "OPER_LOGIN",
         "OPER_DESC_ABREV", "OPER_PASSWORD", "OPER_IND_ADMIN",
         "OPER_IND_DESC", "OPER_EMPR", "OPER_SUC"
       ) VALUES ($1, $2, $3, $4, $5, $6, 'S', 'N', $7, $8)
       ON CONFLICT ("OPER_CODIGO") DO UPDATE SET
         "OPER_PASSWORD" = EXCLUDED."OPER_PASSWORD",
         "OPER_IND_ADMIN" = 'S',
         "OPER_IND_DESC" = 'N'`,
      [
        ADMIN.codigo, ADMIN.nombre, ADMIN.apellido, ADMIN.login,
        ADMIN.descAbrev, hash, ADMIN.empresa, ADMIN.sucursal,
      ]
    );

    await client.query('COMMIT');

    console.log('✓ Usuario admin creado exitosamente');
    console.log(`  Login:    ${ADMIN.login}`);
    console.log(`  Password: ${ADMIN.password}`);
    console.log('  IMPORTANTE: cambia la contraseña en producción.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al crear el admin:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
