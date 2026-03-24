/**
 * Seed de sistemas y programas del módulo GEN.
 * Uso: node src/scripts/seed-gen.js
 */

const { Pool } = require('pg');
const { getPoolConfig } = require('../config/dbConfig');

const pool = new Pool(getPoolConfig());

// PROG_TIPO_PROGRAMA: 1 = menú/pantalla, 2 = proceso, 3 = reporte
// PROG_TECNOLOGIA: 'W' = Web
const SISTEMAS = [
  { codigo: 1, desc: 'Administración General', abrev: 'GEN', habilitado: 'S' },
];

const PROGRAMAS = [
  // sistema, tipo, codigo, clave, desc, ruta
  { sist: 1, tipo: 1, cod: 1,  clave: 10001, desc: 'Operadores',           ruta: '/gen/operadores' },
  { sist: 1, tipo: 1, cod: 2,  clave: 10002, desc: 'Roles',                ruta: '/gen/roles' },
  { sist: 1, tipo: 1, cod: 3,  clave: 10003, desc: 'Empresas',             ruta: '/gen/empresas' },
  { sist: 1, tipo: 1, cod: 4,  clave: 10004, desc: 'Sucursales',           ruta: '/gen/sucursales' },
  { sist: 1, tipo: 1, cod: 5,  clave: 10005, desc: 'Sistemas',             ruta: '/gen/sistemas' },
  { sist: 1, tipo: 1, cod: 6,  clave: 10006, desc: 'Programas',            ruta: '/gen/programas' },
  { sist: 1, tipo: 1, cod: 7,  clave: 10007, desc: 'Monedas',              ruta: '/gen/monedas' },
  { sist: 1, tipo: 1, cod: 8,  clave: 10008, desc: 'Paises',               ruta: '/gen/paises' },
  { sist: 1, tipo: 1, cod: 9,  clave: 10009, desc: 'Departamentos',        ruta: '/gen/departamentos' },
  { sist: 1, tipo: 1, cod: 10, clave: 10010, desc: 'Secciones',            ruta: '/gen/secciones' },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const s of SISTEMAS) {
      await client.query(
        `INSERT INTO "GEN_SISTEMA" ("SIST_CODIGO", "SIST_DESC", "SIST_DESC_ABREV", "SIST_IND_HABILITADO")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("SIST_CODIGO") DO UPDATE SET
           "SIST_DESC" = EXCLUDED."SIST_DESC",
           "SIST_DESC_ABREV" = EXCLUDED."SIST_DESC_ABREV",
           "SIST_IND_HABILITADO" = EXCLUDED."SIST_IND_HABILITADO"`,
        [s.codigo, s.desc, s.abrev, s.habilitado]
      );
      console.log(`  Sistema: [${s.abrev}] ${s.desc}`);
    }

    for (const p of PROGRAMAS) {
      await client.query(
        `INSERT INTO "GEN_PROGRAMA"
           ("PROG_CLAVE", "PROG_SISTEMA", "PROG_TIPO_PROGRAMA", "PROG_CODIGO",
            "PROG_DESC", "PROG_OPERACION", "PROG_IND_HAB_SUCURSAL", "PROG_TECNOLOGIA")
         VALUES ($1, $2, $3, $4, $5, $6, 'N', 'W')
         ON CONFLICT ("PROG_CLAVE") DO UPDATE SET
           "PROG_DESC" = EXCLUDED."PROG_DESC",
           "PROG_OPERACION" = EXCLUDED."PROG_OPERACION"`,
        [p.clave, p.sist, p.tipo, p.cod, p.desc, p.ruta]
      );
      console.log(`    Programa: [${p.clave}] ${p.desc}`);
    }

    // Rol Administrador con acceso a todo GEN
    await client.query(
      `INSERT INTO "GEN_ROL" ("ROL_CODIGO", "ROL_NOMBRE") VALUES (1, 'Administrador')
       ON CONFLICT ("ROL_CODIGO") DO UPDATE SET "ROL_NOMBRE" = EXCLUDED."ROL_NOMBRE"`
    );
    await client.query(
      `INSERT INTO "GEN_ROL" ("ROL_CODIGO", "ROL_NOMBRE") VALUES (2, 'Solo lectura')
       ON CONFLICT ("ROL_CODIGO") DO UPDATE SET "ROL_NOMBRE" = EXCLUDED."ROL_NOMBRE"`
    );

    // Asignar sistema GEN al rol Administrador
    await client.query(`DELETE FROM "GEN_ROL_SISTEMA" WHERE "ROSI_ROL" = 1`);
    await client.query(
      `INSERT INTO "GEN_ROL_SISTEMA" ("ROSI_ROL", "ROSI_SISTEMA") VALUES (1, 1)`
    );

    // Asignar todos los programas de GEN al rol Administrador
    await client.query(`DELETE FROM "GEN_ROL_PROGRAMA" WHERE "ROPR_ROL" = 1`);
    for (const p of PROGRAMAS) {
      await client.query(
        `INSERT INTO "GEN_ROL_PROGRAMA" ("ROPR_ROL", "ROPR_PROGRAMA") VALUES (1, $1)`,
        [p.clave]
      );
    }

    // Asignar rol Administrador al operador admin (codigo 1)
    await client.query(`DELETE FROM "GEN_OPERADOR_ROL" WHERE "OPRO_OPERADOR" = 1`);
    await client.query(
      `INSERT INTO "GEN_OPERADOR_ROL" ("OPRO_OPERADOR", "OPRO_ROL") VALUES (1, 1)`
    );

    await client.query('COMMIT');

    console.log('\nSeed completado:');
    console.log(`  ${SISTEMAS.length} sistema(s)`);
    console.log(`  ${PROGRAMAS.length} programa(s)`);
    console.log('  Roles: Administrador (cod 1), Solo lectura (cod 2)');
    console.log('  Operador admin asignado al rol Administrador');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
