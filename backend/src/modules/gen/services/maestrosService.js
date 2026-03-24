const pool = require('../../../config/db');

// ─── MONEDAS ────────────────────────────────────────────────────────────────

const getMonedas = async () => {
  const { rows } = await pool.query(
    `SELECT "MON_CODIGO" AS mon_codigo, "MON_DESC" AS mon_desc, "MON_SIMBOLO" AS mon_simbolo,
            "MON_TASA_VTA" AS mon_tasa_vta, "MON_TASA_COMP" AS mon_tasa_comp
     FROM gen_moneda ORDER BY "MON_CODIGO"`
  );
  return rows;
};

const getMoneda = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "MON_CODIGO" AS mon_codigo, "MON_DESC" AS mon_desc, "MON_SIMBOLO" AS mon_simbolo,
            "MON_TASA_VTA" AS mon_tasa_vta, "MON_TASA_COMP" AS mon_tasa_comp
     FROM gen_moneda WHERE "MON_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Moneda no encontrada' };
  return rows[0];
};

const createMoneda = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("MON_CODIGO"), 0) + 1 AS next FROM gen_moneda');
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO gen_moneda ("MON_CODIGO","MON_DESC","MON_SIMBOLO","MON_TASA_COMP","MON_TASA_VTA")
     VALUES ($1,$2,$3,$4,$5)`,
    [codigo, data.mon_desc, data.mon_simbolo || null, data.mon_tasa_comp || 0, data.mon_tasa_vta || 0]
  );
  return getMoneda(codigo);
};

const updateMoneda = async (codigo, data) => {
  const fields = []; const params = [];
  const map = { mon_desc: '"MON_DESC"', mon_simbolo: '"MON_SIMBOLO"', mon_tasa_comp: '"MON_TASA_COMP"', mon_tasa_vta: '"MON_TASA_VTA"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getMoneda(codigo);
  params.push(codigo);
  await pool.query(`UPDATE gen_moneda SET ${fields.join(', ')} WHERE "MON_CODIGO" = $${params.length}`, params);
  return getMoneda(codigo);
};

const deleteMoneda = async (codigo) => {
  await pool.query('DELETE FROM gen_moneda WHERE "MON_CODIGO" = $1', [codigo]);
};

// ─── PAÍSES ─────────────────────────────────────────────────────────────────

const getPaises = async () => {
  const { rows } = await pool.query(
    `SELECT "PAIS_CODIGO" AS pais_codigo, "PAIS_DESC" AS pais_desc, "PAIS_NACIONALIDAD" AS pais_nacionalidad
     FROM gen_pais ORDER BY "PAIS_DESC"`
  );
  return rows;
};

const getPais = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "PAIS_CODIGO" AS pais_codigo, "PAIS_DESC" AS pais_desc, "PAIS_NACIONALIDAD" AS pais_nacionalidad
     FROM gen_pais WHERE "PAIS_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'País no encontrado' };
  return rows[0];
};

const createPais = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("PAIS_CODIGO"), 0) + 1 AS next FROM gen_pais');
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO gen_pais ("PAIS_CODIGO","PAIS_DESC","PAIS_NACIONALIDAD") VALUES ($1,$2,$3)`,
    [codigo, data.pais_desc, data.pais_nacionalidad || null]
  );
  return getPais(codigo);
};

const updatePais = async (codigo, data) => {
  const fields = []; const params = [];
  const map = { pais_desc: '"PAIS_DESC"', pais_nacionalidad: '"PAIS_NACIONALIDAD"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getPais(codigo);
  params.push(codigo);
  await pool.query(`UPDATE gen_pais SET ${fields.join(', ')} WHERE "PAIS_CODIGO" = $${params.length}`, params);
  return getPais(codigo);
};

const deletePais = async (codigo) => {
  await pool.query('DELETE FROM gen_pais WHERE "PAIS_CODIGO" = $1', [codigo]);
};

// ─── CIUDADES ────────────────────────────────────────────────────────────────

const getCiudades = async () => {
  const { rows } = await pool.query(
    `SELECT "CIUDAD_CODIGO" AS ciudad_codigo, "CIUDAD_DESC" AS ciudad_desc
     FROM gen_ciudad ORDER BY "CIUDAD_DESC"`
  );
  return rows;
};

// ─── DEPARTAMENTOS ───────────────────────────────────────────────────────────

const getDepartamentos = async () => {
  const { rows } = await pool.query(
    `SELECT "DPTO_CODIGO" AS dpto_codigo, "DPTO_DESC" AS dpto_desc
     FROM gen_departamento ORDER BY "DPTO_DESC"`
  );
  return rows;
};

const getDepartamento = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "DPTO_CODIGO" AS dpto_codigo, "DPTO_DESC" AS dpto_desc
     FROM gen_departamento WHERE "DPTO_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Departamento no encontrado' };
  return rows[0];
};

const createDepartamento = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("DPTO_CODIGO"), 0) + 1 AS next FROM gen_departamento');
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO gen_departamento ("DPTO_CODIGO","DPTO_DESC") VALUES ($1,$2)`,
    [codigo, data.dpto_desc]
  );
  return getDepartamento(codigo);
};

const updateDepartamento = async (codigo, data) => {
  await pool.query('UPDATE gen_departamento SET "DPTO_DESC" = $1 WHERE "DPTO_CODIGO" = $2', [data.dpto_desc, codigo]);
  return getDepartamento(codigo);
};

const deleteDepartamento = async (codigo) => {
  await pool.query('DELETE FROM gen_departamento WHERE "DPTO_CODIGO" = $1', [codigo]);
};

// ─── SECCIONES ───────────────────────────────────────────────────────────────

const getSecciones = async (dptoCodigo) => {
  const query = dptoCodigo
    ? `SELECT "SECC_DPTO" AS secc_dpto, "SECC_CODIGO" AS secc_codigo, "SECC_DESC" AS secc_desc
       FROM gen_seccion WHERE "SECC_DPTO" = $1 ORDER BY "SECC_DESC"`
    : `SELECT "SECC_DPTO" AS secc_dpto, "SECC_CODIGO" AS secc_codigo, "SECC_DESC" AS secc_desc
       FROM gen_seccion ORDER BY "SECC_DESC"`;
  const { rows } = await pool.query(query, dptoCodigo ? [dptoCodigo] : []);
  return rows;
};

const createSeccion = async (dptoCodigo, data) => {
  const { rows } = await pool.query(
    'SELECT COALESCE(MAX("SECC_CODIGO"), 0) + 1 AS next FROM gen_seccion WHERE "SECC_DPTO" = $1',
    [dptoCodigo]
  );
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO gen_seccion ("SECC_DPTO","SECC_CODIGO","SECC_DESC") VALUES ($1,$2,$3)`,
    [dptoCodigo, codigo, data.secc_desc]
  );
  return getSecciones(dptoCodigo);
};

const updateSeccion = async (dptoCodigo, secCodigo, data) => {
  await pool.query(
    'UPDATE gen_seccion SET "SECC_DESC" = $1 WHERE "SECC_DPTO" = $2 AND "SECC_CODIGO" = $3',
    [data.secc_desc, dptoCodigo, secCodigo]
  );
  return getSecciones(dptoCodigo);
};

const deleteSeccion = async (dptoCodigo, secCodigo) => {
  await pool.query(
    'DELETE FROM gen_seccion WHERE "SECC_DPTO" = $1 AND "SECC_CODIGO" = $2',
    [dptoCodigo, secCodigo]
  );
};

// ─── SISTEMAS ────────────────────────────────────────────────────────────────

const getSistemas = async () => {
  const { rows } = await pool.query(
    `SELECT "SIST_CODIGO" AS sist_codigo, "SIST_DESC" AS sist_desc,
            "SIST_DESC_ABREV" AS sist_desc_abrev, "SIST_IND_HABILITADO" AS sist_ind_habilitado
     FROM gen_sistema ORDER BY "SIST_DESC"`
  );
  return rows;
};

// ─── PROGRAMAS ───────────────────────────────────────────────────────────────

const getProgramas = async (sistemaCodigo) => {
  const where = sistemaCodigo ? 'WHERE p."PROG_SISTEMA" = $1' : '';
  const params = sistemaCodigo ? [sistemaCodigo] : [];
  const { rows } = await pool.query(
    `SELECT p."PROG_CLAVE" AS prog_clave, p."PROG_DESC" AS prog_desc,
            p."PROG_SISTEMA" AS prog_sistema, s."SIST_DESC" AS sist_desc,
            p."PROG_TIPO_PROGRAMA" AS prog_tipo_programa, p."PROG_ESTADO" AS prog_estado
     FROM gen_programa p
     JOIN gen_sistema s ON s."SIST_CODIGO" = p."PROG_SISTEMA"
     ${where} ORDER BY s."SIST_DESC", p."PROG_DESC"`,
    params
  );
  return rows;
};

const getPrograma = async (clave) => {
  const { rows } = await pool.query(
    `SELECT p."PROG_CLAVE" AS prog_clave, p."PROG_DESC" AS prog_desc,
            p."PROG_SISTEMA" AS prog_sistema, s."SIST_DESC" AS sist_desc,
            p."PROG_TIPO_PROGRAMA" AS prog_tipo_programa, p."PROG_ESTADO" AS prog_estado
     FROM gen_programa p
     JOIN gen_sistema s ON s."SIST_CODIGO" = p."PROG_SISTEMA"
     WHERE p."PROG_CLAVE" = $1`, [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Programa no encontrado' };
  return rows[0];
};

const createPrograma = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("PROG_CLAVE"), 0) + 1 AS next FROM gen_programa');
  const clave = rows[0].next;
  await pool.query(
    `INSERT INTO gen_programa ("PROG_CLAVE","PROG_SISTEMA","PROG_DESC","PROG_ESTADO")
     VALUES ($1,$2,$3,$4)`,
    [clave, data.prog_sistema, data.prog_desc, data.prog_estado || 'A']
  );
  return getPrograma(clave);
};

const updatePrograma = async (clave, data) => {
  const fields = []; const params = [];
  const map = { prog_desc: '"PROG_DESC"', prog_sistema: '"PROG_SISTEMA"', prog_estado: '"PROG_ESTADO"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getPrograma(clave);
  params.push(clave);
  await pool.query(`UPDATE gen_programa SET ${fields.join(', ')} WHERE "PROG_CLAVE" = $${params.length}`, params);
  return getPrograma(clave);
};

const deletePrograma = async (clave) => {
  await pool.query('DELETE FROM gen_rol_programa WHERE "ROPR_PROGRAMA" = $1', [clave]);
  await pool.query('DELETE FROM gen_programa WHERE "PROG_CLAVE" = $1', [clave]);
};

module.exports = {
  getMonedas, getMoneda, createMoneda, updateMoneda, deleteMoneda,
  getPaises, getPais, createPais, updatePais, deletePais,
  getCiudades,
  getDepartamentos, getDepartamento, createDepartamento, updateDepartamento, deleteDepartamento,
  getSecciones, createSeccion, updateSeccion, deleteSeccion,
  getSistemas,
  getProgramas, getPrograma, createPrograma, updatePrograma, deletePrograma,
};
