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

const getCiudades = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "CIUDAD_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM gen_ciudad ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"CIUDAD_CODIGO"', desc: '"CIUDAD_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"CIUDAD_DESC" ASC';
  const select = `SELECT "CIUDAD_CODIGO" AS ciudad_codigo, "CIUDAD_DESC" AS ciudad_desc FROM gen_ciudad ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getCiudad = async (codigo) => {
  const { rows } = await pool.query(`SELECT "CIUDAD_CODIGO" AS ciudad_codigo, "CIUDAD_DESC" AS ciudad_desc FROM gen_ciudad WHERE "CIUDAD_CODIGO" = $1`, [codigo]);
  if (!rows.length) throw { status: 404, message: 'Ciudad no encontrada' };
  return rows[0];
};

const createCiudad = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("CIUDAD_CODIGO"), 0) + 1 AS next FROM gen_ciudad');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO gen_ciudad ("CIUDAD_CODIGO","CIUDAD_DESC") VALUES ($1,$2)`, [codigo, data.ciudad_desc]);
  return getCiudad(codigo);
};

const updateCiudad = async (codigo, data) => {
  await pool.query('UPDATE gen_ciudad SET "CIUDAD_DESC" = $1 WHERE "CIUDAD_CODIGO" = $2', [data.ciudad_desc, codigo]);
  return getCiudad(codigo);
};

const deleteCiudad = async (codigo) => {
  await pool.query('DELETE FROM gen_ciudad WHERE "CIUDAD_CODIGO" = $1', [codigo]);
};

// ─── IMPUESTOS ───────────────────────────────────────────────────────────────

const getImpuestos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "IMPU_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM gen_impuesto ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"IMPU_CODIGO"', desc: '"IMPU_DESC"', porc: '"IMPU_PORCENTAJE"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"IMPU_CODIGO" ASC';
  const select = `SELECT "IMPU_CODIGO" AS impu_codigo, "IMPU_DESC" AS impu_desc,
    "IMPU_PORCENTAJE" AS impu_porcentaje, "IMPU_INCLUIDO" AS impu_incluido,
    "IMPU_PORC_BASE_IMPONIBLE" AS impu_porc_base_imponible, "IMPU_COD_SET" AS impu_cod_set
    FROM gen_impuesto ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getImpuesto = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "IMPU_CODIGO" AS impu_codigo, "IMPU_DESC" AS impu_desc,
     "IMPU_PORCENTAJE" AS impu_porcentaje, "IMPU_INCLUIDO" AS impu_incluido,
     "IMPU_PORC_BASE_IMPONIBLE" AS impu_porc_base_imponible, "IMPU_COD_SET" AS impu_cod_set
     FROM gen_impuesto WHERE "IMPU_CODIGO" = $1`, [codigo]);
  if (!rows.length) throw { status: 404, message: 'Impuesto no encontrado' };
  return rows[0];
};

const createImpuesto = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("IMPU_CODIGO"), 0) + 1 AS next FROM gen_impuesto');
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO gen_impuesto ("IMPU_CODIGO","IMPU_DESC","IMPU_PORCENTAJE","IMPU_INCLUIDO","IMPU_PORC_BASE_IMPONIBLE","IMPU_COD_SET")
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [codigo, data.impu_desc, data.impu_porcentaje ?? 0, data.impu_incluido ?? 'N', data.impu_porc_base_imponible ?? 100, data.impu_cod_set ?? 1]
  );
  return getImpuesto(codigo);
};

const updateImpuesto = async (codigo, data) => {
  const fields = []; const params = [];
  const map = {
    impu_desc: '"IMPU_DESC"', impu_porcentaje: '"IMPU_PORCENTAJE"',
    impu_incluido: '"IMPU_INCLUIDO"', impu_porc_base_imponible: '"IMPU_PORC_BASE_IMPONIBLE"',
    impu_cod_set: '"IMPU_COD_SET"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getImpuesto(codigo);
  params.push(codigo);
  await pool.query(`UPDATE gen_impuesto SET ${fields.join(', ')} WHERE "IMPU_CODIGO" = $${params.length}`, params);
  return getImpuesto(codigo);
};

const deleteImpuesto = async (codigo) => {
  await pool.query('DELETE FROM gen_impuesto WHERE "IMPU_CODIGO" = $1', [codigo]);
};

// ─── TIPOS DE IMPUESTO ───────────────────────────────────────────────────────

const getTiposImpuesto = async () => {
  const { rows } = await pool.query(
    `SELECT "TIMPU_CODIGO" AS timpu_codigo, "TIMPU_DESC" AS timpu_desc,
     "TIMPU_IVA_N" AS timpu_iva_n, "TIMPU_IRP_RPS_N" AS timpu_irp_rps_n,
     "TIMPU_IRE_SIMPLE_N" AS timpu_ire_simple_n,
     "TIMPU_IND_IMPUTA_EXENTA" AS timpu_ind_imputa_exenta,
     "TIMPU_IND_IMPUTA" AS timpu_ind_imputa
     FROM gen_tipo_impuesto ORDER BY "TIMPU_CODIGO"`
  );
  return rows;
};

const getTipoImpuesto = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "TIMPU_CODIGO" AS timpu_codigo, "TIMPU_DESC" AS timpu_desc,
     "TIMPU_IVA_N" AS timpu_iva_n, "TIMPU_IRP_RPS_N" AS timpu_irp_rps_n,
     "TIMPU_IRE_SIMPLE_N" AS timpu_ire_simple_n,
     "TIMPU_IND_IMPUTA_EXENTA" AS timpu_ind_imputa_exenta,
     "TIMPU_IND_IMPUTA" AS timpu_ind_imputa
     FROM gen_tipo_impuesto WHERE "TIMPU_CODIGO" = $1`, [codigo]);
  if (!rows.length) throw { status: 404, message: 'Tipo de impuesto no encontrado' };
  return rows[0];
};

const createTipoImpuesto = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("TIMPU_CODIGO"), 0) + 1 AS next FROM gen_tipo_impuesto');
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO gen_tipo_impuesto ("TIMPU_CODIGO","TIMPU_DESC","TIMPU_IVA_N","TIMPU_IRP_RPS_N","TIMPU_IRE_SIMPLE_N","TIMPU_IND_IMPUTA_EXENTA","TIMPU_IND_IMPUTA")
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [codigo, data.timpu_desc, data.timpu_iva_n ?? 'N', data.timpu_irp_rps_n ?? 'N',
     data.timpu_ire_simple_n ?? 'N', data.timpu_ind_imputa_exenta ?? 'N', data.timpu_ind_imputa ?? 'N']
  );
  return getTipoImpuesto(codigo);
};

const updateTipoImpuesto = async (codigo, data) => {
  const fields = []; const params = [];
  const map = {
    timpu_desc: '"TIMPU_DESC"', timpu_iva_n: '"TIMPU_IVA_N"', timpu_irp_rps_n: '"TIMPU_IRP_RPS_N"',
    timpu_ire_simple_n: '"TIMPU_IRE_SIMPLE_N"', timpu_ind_imputa_exenta: '"TIMPU_IND_IMPUTA_EXENTA"',
    timpu_ind_imputa: '"TIMPU_IND_IMPUTA"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getTipoImpuesto(codigo);
  params.push(codigo);
  await pool.query(`UPDATE gen_tipo_impuesto SET ${fields.join(', ')} WHERE "TIMPU_CODIGO" = $${params.length}`, params);
  return getTipoImpuesto(codigo);
};

const deleteTipoImpuesto = async (codigo) => {
  await pool.query('DELETE FROM gen_tipo_impuesto WHERE "TIMPU_CODIGO" = $1', [codigo]);
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

// ─── PROFESIONES ────────────────────────────────────────────────────────────

const getProfesiones = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PROF_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM gen_profesion ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"PROF_DESC" ${dir}` : `"PROF_CODIGO" ${dir}`;
  const select = `SELECT "PROF_CODIGO" AS prof_codigo, "PROF_DESC" AS prof_desc FROM gen_profesion ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createProfesion = async ({ prof_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PROF_CODIGO"), 0) + 1 AS next FROM gen_profesion`);
  await pool.query(`INSERT INTO gen_profesion ("PROF_CODIGO","PROF_DESC") VALUES ($1,$2)`, [next, prof_desc]);
  return { prof_codigo: next, prof_desc };
};

const updateProfesion = async (id, { prof_desc }) => {
  await pool.query(`UPDATE gen_profesion SET "PROF_DESC" = $1 WHERE "PROF_CODIGO" = $2`, [prof_desc, id]);
  return { prof_codigo: id, prof_desc };
};

const deleteProfesion = async (id) => {
  await pool.query(`DELETE FROM gen_profesion WHERE "PROF_CODIGO" = $1`, [id]);
};

// ─── DISTRITOS ──────────────────────────────────────────────────────────────

const getDistritos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc', pais = null } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  const conditions = [];
  if (search) { params.push(`%${search}%`); conditions.push(`d."DIST_DESC" ILIKE $${params.length}`); }
  if (pais) { params.push(pais); conditions.push(`d."DIST_PAIS" = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM gen_distrito d ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const allowedSort = { desc: 'd."DIST_DESC"', pais: 'p."PAIS_DESC"' };
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : `d."DIST_DESC" ${dir}`;
  const select = `SELECT d."DIST_CODIGO" AS dist_codigo, d."DIST_DESC" AS dist_desc,
    d."DIST_PAIS" AS dist_pais, p."PAIS_DESC" AS pais_desc
    FROM gen_distrito d
    LEFT JOIN gen_pais p ON p."PAIS_CODIGO" = d."DIST_PAIS"
    ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createDistrito = async (data) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("DIST_CODIGO"), 0) + 1 AS next FROM gen_distrito`);
  await pool.query(`INSERT INTO gen_distrito ("DIST_CODIGO","DIST_DESC","DIST_PAIS") VALUES ($1,$2,$3)`, [next, data.dist_desc, data.dist_pais || null]);
  return { dist_codigo: next, dist_desc: data.dist_desc, dist_pais: data.dist_pais || null };
};

const updateDistrito = async (id, data) => {
  const fields = []; const params = [];
  if (data.dist_desc !== undefined) { params.push(data.dist_desc); fields.push(`"DIST_DESC" = $${params.length}`); }
  if (data.dist_pais !== undefined) { params.push(data.dist_pais); fields.push(`"DIST_PAIS" = $${params.length}`); }
  if (fields.length) { params.push(id); await pool.query(`UPDATE gen_distrito SET ${fields.join(', ')} WHERE "DIST_CODIGO" = $${params.length}`, params); }
  return { dist_codigo: id, ...data };
};

const deleteDistrito = async (id) => {
  await pool.query(`DELETE FROM gen_distrito WHERE "DIST_CODIGO" = $1`, [id]);
};

// ─── MOTIVOS DE ANULACIÓN ───────────────────────────────────────────────────

const getMotivosAnulacion = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "MOAN_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM gen_motivo_anulacion ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"MOAN_DESC" ${dir}` : `"MOAN_CODIGO" ${dir}`;
  const select = `SELECT "MOAN_CODIGO" AS moan_codigo, "MOAN_DESC" AS moan_desc FROM gen_motivo_anulacion ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createMotivoAnulacion = async ({ moan_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("MOAN_CODIGO"), 0) + 1 AS next FROM gen_motivo_anulacion`);
  await pool.query(`INSERT INTO gen_motivo_anulacion ("MOAN_CODIGO","MOAN_DESC") VALUES ($1,$2)`, [next, moan_desc]);
  return { moan_codigo: next, moan_desc };
};

const updateMotivoAnulacion = async (id, { moan_desc }) => {
  await pool.query(`UPDATE gen_motivo_anulacion SET "MOAN_DESC" = $1 WHERE "MOAN_CODIGO" = $2`, [moan_desc, id]);
  return { moan_codigo: id, moan_desc };
};

const deleteMotivoAnulacion = async (id) => {
  await pool.query(`DELETE FROM gen_motivo_anulacion WHERE "MOAN_CODIGO" = $1`, [id]);
};

// ─── LOCALIDADES ────────────────────────────────────────────────────────────

const getLocalidades = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc', dep = null, distrito = null } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  const conditions = [];
  if (search) { params.push(`%${search}%`); conditions.push(`l."LOC_DESC" ILIKE $${params.length}`); }
  if (distrito) { params.push(distrito); conditions.push(`l."LOC_DISTRITO" = $${params.length}`); }
  else if (dep) { params.push(dep); conditions.push(`l."LOC_DEP_CODIGO" = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM gen_localidad l ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const allowedSort = { desc: `l."LOC_DESC"`, dep: `d."DPTO_DESC"` };
  const orderCol = allowedSort[sortField] || `l."LOC_CODIGO"`;
  const select = `SELECT l."LOC_CODIGO" AS loc_codigo, l."LOC_DESC" AS loc_desc,
    l."LOC_DEP_CODIGO" AS loc_dep_codigo, d."DPTO_DESC" AS dpto_desc,
    l."LOC_DISTRITO" AS loc_distrito, di."DIST_DESC" AS dist_desc
    FROM gen_localidad l
    LEFT JOIN gen_departamento d ON d."DPTO_CODIGO" = l."LOC_DEP_CODIGO"
    LEFT JOIN gen_distrito di ON di."DIST_CODIGO" = l."LOC_DISTRITO"
    ${where} ORDER BY ${orderCol} ${dir}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createLocalidad = async ({ loc_desc, loc_dep_codigo, loc_distrito }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("LOC_CODIGO"), 0) + 1 AS next FROM gen_localidad`);
  await pool.query(`INSERT INTO gen_localidad ("LOC_CODIGO","LOC_DESC","LOC_DEP_CODIGO","LOC_DISTRITO") VALUES ($1,$2,$3,$4)`,
    [next, loc_desc, loc_dep_codigo || null, loc_distrito || null]);
  return { loc_codigo: next, loc_desc, loc_dep_codigo, loc_distrito };
};

const updateLocalidad = async (id, { loc_desc, loc_dep_codigo, loc_distrito }) => {
  await pool.query(`UPDATE gen_localidad SET "LOC_DESC" = $1, "LOC_DEP_CODIGO" = $2, "LOC_DISTRITO" = $3 WHERE "LOC_CODIGO" = $4`,
    [loc_desc, loc_dep_codigo || null, loc_distrito || null, id]);
  return { loc_codigo: id, loc_desc, loc_dep_codigo, loc_distrito };
};

const deleteLocalidad = async (id) => {
  await pool.query(`DELETE FROM gen_localidad WHERE "LOC_CODIGO" = $1`, [id]);
};

// ─── BARRIOS ────────────────────────────────────────────────────────────────

const getBarrios = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc', loc = null } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  const conditions = [];
  if (search) { params.push(`%${search}%`); conditions.push(`b."BARR_DESC" ILIKE $${params.length}`); }
  if (loc) { params.push(loc); conditions.push(`b."BARR_CODIGO_LOC" = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM gen_barrio b ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const allowedSort = { desc: `b."BARR_DESC"`, loc: `l."LOC_DESC"` };
  const orderCol = allowedSort[sortField] || `b."BARR_CODIGO"`;
  const select = `SELECT b."BARR_CODIGO" AS barr_codigo, b."BARR_DESC" AS barr_desc,
    b."BARR_CODIGO_LOC" AS barr_codigo_loc, l."LOC_DESC" AS loc_desc,
    l."LOC_DISTRITO" AS barr_distrito, dist."DIST_DESC" AS dist_desc
    FROM gen_barrio b
    LEFT JOIN gen_localidad l ON l."LOC_CODIGO" = b."BARR_CODIGO_LOC"
    LEFT JOIN gen_distrito dist ON dist."DIST_CODIGO" = l."LOC_DISTRITO"
    ${where} ORDER BY ${orderCol} ${dir}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createBarrio = async ({ barr_desc, barr_codigo_loc, barr_codigo_dep }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("BARR_CODIGO"), 0) + 1 AS next FROM gen_barrio`);
  await pool.query(`INSERT INTO gen_barrio ("BARR_CODIGO","BARR_DESC","BARR_CODIGO_LOC","BARR_CODIGO_DEP") VALUES ($1,$2,$3,$4)`,
    [next, barr_desc, barr_codigo_loc || null, barr_codigo_dep || null]);
  return { barr_codigo: next, barr_desc, barr_codigo_loc, barr_codigo_dep };
};

const updateBarrio = async (id, { barr_desc, barr_codigo_loc, barr_codigo_dep }) => {
  await pool.query(`UPDATE gen_barrio SET "BARR_DESC" = $1, "BARR_CODIGO_LOC" = $2, "BARR_CODIGO_DEP" = $3 WHERE "BARR_CODIGO" = $4`,
    [barr_desc, barr_codigo_loc || null, barr_codigo_dep || null, id]);
  return { barr_codigo: id, barr_desc, barr_codigo_loc, barr_codigo_dep };
};

const deleteBarrio = async (id) => {
  await pool.query(`DELETE FROM gen_barrio WHERE "BARR_CODIGO" = $1`, [id]);
};

// ─── PLANES PANTALLA (DOOH) ─────────────────────────────────────────────────

const getPlanesPantalla = async () => {
  const { rows } = await pool.query(
    `SELECT "PLAN_CODIGO" AS plan_codigo, "PLAN_NOMBRE" AS plan_nombre,
            "PLAN_INSERCIONES" AS plan_inserciones, "PLAN_DESCRIPCION" AS plan_descripcion,
            "PLAN_ORDEN" AS plan_orden, "PLAN_ACTIVO" AS plan_activo
     FROM gen_plan_pantalla ORDER BY "PLAN_ORDEN", "PLAN_CODIGO"`
  );
  return rows;
};

const getPlanPantalla = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "PLAN_CODIGO" AS plan_codigo, "PLAN_NOMBRE" AS plan_nombre,
            "PLAN_INSERCIONES" AS plan_inserciones, "PLAN_DESCRIPCION" AS plan_descripcion,
            "PLAN_ORDEN" AS plan_orden, "PLAN_ACTIVO" AS plan_activo
     FROM gen_plan_pantalla WHERE "PLAN_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Plan no encontrado' };
  return rows[0];
};

const createPlanPantalla = async (data) => {
  if (!data.plan_codigo || !data.plan_nombre) throw { status: 400, message: 'plan_codigo y plan_nombre son requeridos' };
  const codigo = data.plan_codigo.toUpperCase().trim();
  // Validar que no exista
  const { rows: existing } = await pool.query('SELECT 1 FROM gen_plan_pantalla WHERE "PLAN_CODIGO" = $1', [codigo]);
  if (existing.length) throw { status: 409, message: `El plan "${codigo}" ya existe` };
  // Obtener siguiente orden
  const { rows: maxOrd } = await pool.query('SELECT COALESCE(MAX("PLAN_ORDEN"), 0) + 1 AS next FROM gen_plan_pantalla');
  await pool.query(
    `INSERT INTO gen_plan_pantalla ("PLAN_CODIGO","PLAN_NOMBRE","PLAN_INSERCIONES","PLAN_DESCRIPCION","PLAN_ORDEN","PLAN_ACTIVO")
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [codigo, data.plan_nombre, data.plan_inserciones || 280, data.plan_descripcion || null, data.plan_orden ?? maxOrd[0].next, data.plan_activo ?? 'S']
  );
  return getPlanPantalla(codigo);
};

const updatePlanPantalla = async (codigo, data) => {
  const fields = []; const params = [];
  const map = {
    plan_nombre: '"PLAN_NOMBRE"',
    plan_inserciones: '"PLAN_INSERCIONES"',
    plan_descripcion: '"PLAN_DESCRIPCION"',
    plan_orden: '"PLAN_ORDEN"',
    plan_activo: '"PLAN_ACTIVO"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getPlanPantalla(codigo);
  params.push(codigo);
  await pool.query(`UPDATE gen_plan_pantalla SET ${fields.join(', ')} WHERE "PLAN_CODIGO" = $${params.length}`, params);

  // Si cambiaron las inserciones, propagar a todos los precios existentes de este plan
  if (data.plan_inserciones !== undefined) {
    await pool.query(
      `UPDATE fac_lista_precio_pantalla_det SET "LPPD_INSERCIONES_MES" = $1 WHERE "LPPD_PLAN" = $2`,
      [data.plan_inserciones, codigo]
    );
  }

  return getPlanPantalla(codigo);
};

const deletePlanPantalla = async (codigo) => {
  // Verificar que no tenga precios asociados
  const { rows } = await pool.query('SELECT 1 FROM fac_lista_precio_pantalla_det WHERE "LPPD_PLAN" = $1 LIMIT 1', [codigo]);
  if (rows.length) throw { status: 409, message: 'No se puede eliminar: hay precios asociados a este plan' };
  await pool.query('DELETE FROM gen_plan_pantalla WHERE "PLAN_CODIGO" = $1', [codigo]);
};

module.exports = {
  getMonedas, getMoneda, createMoneda, updateMoneda, deleteMoneda,
  getPaises, getPais, createPais, updatePais, deletePais,
  getCiudades, getCiudad, createCiudad, updateCiudad, deleteCiudad,
  getDepartamentos, getDepartamento, createDepartamento, updateDepartamento, deleteDepartamento,
  getSecciones, createSeccion, updateSeccion, deleteSeccion,
  getSistemas,
  getProgramas, getPrograma, createPrograma, updatePrograma, deletePrograma,
  getImpuestos, getImpuesto, createImpuesto, updateImpuesto, deleteImpuesto,
  getTiposImpuesto, getTipoImpuesto, createTipoImpuesto, updateTipoImpuesto, deleteTipoImpuesto,
  getProfesiones, createProfesion, updateProfesion, deleteProfesion,
  getDistritos, createDistrito, updateDistrito, deleteDistrito,
  getMotivosAnulacion, createMotivoAnulacion, updateMotivoAnulacion, deleteMotivoAnulacion,
  getLocalidades, createLocalidad, updateLocalidad, deleteLocalidad,
  getBarrios, createBarrio, updateBarrio, deleteBarrio,
  getPlanesPantalla, getPlanPantalla, createPlanPantalla, updatePlanPantalla, deletePlanPantalla,
};
