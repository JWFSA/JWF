const pool = require('../../../config/db');

// ─── BANCOS ───────────────────────────────────────────────────────────────────

const getBancos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "BCO_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fin_banco ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"BCO_CODIGO"', desc: '"BCO_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"BCO_DESC" ASC';
  const select = `SELECT "BCO_CODIGO" AS bco_codigo, "BCO_DESC" AS bco_desc, "BCO_PAIS" AS bco_pais
    FROM fin_banco ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getBanco = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "BCO_CODIGO" AS bco_codigo, "BCO_DESC" AS bco_desc, "BCO_PAIS" AS bco_pais FROM fin_banco WHERE "BCO_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Banco no encontrado' };
  return rows[0];
};

const createBanco = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("BCO_CODIGO"), 0) + 1 AS next FROM fin_banco');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO fin_banco ("BCO_CODIGO","BCO_DESC","BCO_PAIS") VALUES ($1,$2,$3)`,
    [codigo, data.bco_desc, data.bco_pais || null]);
  return getBanco(codigo);
};

const updateBanco = async (codigo, data) => {
  const fields = []; const params = [];
  const map = { bco_desc: '"BCO_DESC"', bco_pais: '"BCO_PAIS"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getBanco(codigo);
  params.push(codigo);
  await pool.query(`UPDATE fin_banco SET ${fields.join(', ')} WHERE "BCO_CODIGO" = $${params.length}`, params);
  return getBanco(codigo);
};

const deleteBanco = async (codigo) => {
  await pool.query('DELETE FROM fin_banco WHERE "BCO_CODIGO" = $1', [codigo]);
};

// ─── FORMAS DE PAGO ───────────────────────────────────────────────────────────

const getFormasPago = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "FPAG_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fin_forma_pago ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"FPAG_CODIGO"', desc: '"FPAG_DESC"', dias: '"FPAG_DIA_PAGO"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"FPAG_DESC" ASC';
  const select = `SELECT "FPAG_CODIGO" AS fpag_codigo, "FPAG_DESC" AS fpag_desc,
    "FPAG_DIA_PAGO" AS fpag_dia_pago, "FPAG_IND_FACT" AS fpag_ind_fact
    FROM fin_forma_pago ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getFormaPago = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "FPAG_CODIGO" AS fpag_codigo, "FPAG_DESC" AS fpag_desc,
     "FPAG_DIA_PAGO" AS fpag_dia_pago, "FPAG_IND_FACT" AS fpag_ind_fact
     FROM fin_forma_pago WHERE "FPAG_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Forma de pago no encontrada' };
  return rows[0];
};

const createFormaPago = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("FPAG_CODIGO"), 0) + 1 AS next FROM fin_forma_pago');
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO fin_forma_pago ("FPAG_CODIGO","FPAG_DESC","FPAG_DIA_PAGO","FPAG_IND_FACT") VALUES ($1,$2,$3,$4)`,
    [codigo, data.fpag_desc, data.fpag_dia_pago || null, data.fpag_ind_fact || null]
  );
  return getFormaPago(codigo);
};

const updateFormaPago = async (codigo, data) => {
  const fields = []; const params = [];
  const map = { fpag_desc: '"FPAG_DESC"', fpag_dia_pago: '"FPAG_DIA_PAGO"', fpag_ind_fact: '"FPAG_IND_FACT"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getFormaPago(codigo);
  params.push(codigo);
  await pool.query(`UPDATE fin_forma_pago SET ${fields.join(', ')} WHERE "FPAG_CODIGO" = $${params.length}`, params);
  return getFormaPago(codigo);
};

const deleteFormaPago = async (codigo) => {
  await pool.query('DELETE FROM fin_forma_pago WHERE "FPAG_CODIGO" = $1', [codigo]);
};

// ─── RAMOS ────────────────────────────────────────────────────────────────────

const getRamos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "RAMO_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fin_ramo ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"RAMO_CODIGO"', desc: '"RAMO_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"RAMO_DESC" ASC';
  const select = `SELECT "RAMO_CODIGO" AS ramo_codigo, "RAMO_DESC" AS ramo_desc, "RAMO_PADRE" AS ramo_padre
    FROM fin_ramo ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getRamo = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "RAMO_CODIGO" AS ramo_codigo, "RAMO_DESC" AS ramo_desc, "RAMO_PADRE" AS ramo_padre
     FROM fin_ramo WHERE "RAMO_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Ramo no encontrado' };
  return rows[0];
};

const createRamo = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("RAMO_CODIGO"), 0) + 1 AS next FROM fin_ramo');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO fin_ramo ("RAMO_CODIGO","RAMO_DESC","RAMO_PADRE") VALUES ($1,$2,$3)`,
    [codigo, data.ramo_desc, data.ramo_padre || null]);
  return getRamo(codigo);
};

const updateRamo = async (codigo, data) => {
  const fields = []; const params = [];
  const map = { ramo_desc: '"RAMO_DESC"', ramo_padre: '"RAMO_PADRE"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getRamo(codigo);
  params.push(codigo);
  await pool.query(`UPDATE fin_ramo SET ${fields.join(', ')} WHERE "RAMO_CODIGO" = $${params.length}`, params);
  return getRamo(codigo);
};

const deleteRamo = async (codigo) => {
  await pool.query('DELETE FROM fin_ramo WHERE "RAMO_CODIGO" = $1', [codigo]);
};

// ─── TIPOS DE PROVEEDOR ───────────────────────────────────────────────────────

const getTiposProveedor = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "TIPR_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fin_tipo_proveedor ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"TIPR_CODIGO"', desc: '"TIPR_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"TIPR_DESC" ASC';
  const select = `SELECT "TIPR_CODIGO" AS tipr_codigo, "TIPR_DESC" AS tipr_desc
    FROM fin_tipo_proveedor ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getTipoProveedor = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "TIPR_CODIGO" AS tipr_codigo, "TIPR_DESC" AS tipr_desc FROM fin_tipo_proveedor WHERE "TIPR_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Tipo de proveedor no encontrado' };
  return rows[0];
};

const createTipoProveedor = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("TIPR_CODIGO"), 0) + 1 AS next FROM fin_tipo_proveedor');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO fin_tipo_proveedor ("TIPR_CODIGO","TIPR_DESC") VALUES ($1,$2)`, [codigo, data.tipr_desc]);
  return getTipoProveedor(codigo);
};

const updateTipoProveedor = async (codigo, data) => {
  if (!data.tipr_desc) return getTipoProveedor(codigo);
  await pool.query(`UPDATE fin_tipo_proveedor SET "TIPR_DESC" = $1 WHERE "TIPR_CODIGO" = $2`, [data.tipr_desc, codigo]);
  return getTipoProveedor(codigo);
};

const deleteTipoProveedor = async (codigo) => {
  await pool.query('DELETE FROM fin_tipo_proveedor WHERE "TIPR_CODIGO" = $1', [codigo]);
};

// ─── PERSONERÍAS ─────────────────────────────────────────────────────────────

const getPersonerias = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PERS_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fin_personeria ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"PERS_CODIGO"', desc: '"PERS_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"PERS_DESC" ASC';
  const select = `SELECT "PERS_CODIGO" AS pers_codigo, "PERS_DESC" AS pers_desc FROM fin_personeria ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getPersoneria = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "PERS_CODIGO" AS pers_codigo, "PERS_DESC" AS pers_desc FROM fin_personeria WHERE "PERS_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Personería no encontrada' };
  return rows[0];
};

const createPersoneria = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("PERS_CODIGO"), 0) + 1 AS next FROM fin_personeria');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO fin_personeria ("PERS_CODIGO","PERS_DESC") VALUES ($1,$2)`, [codigo, data.pers_desc]);
  return getPersoneria(codigo);
};

const updatePersoneria = async (codigo, data) => {
  if (!data.pers_desc) return getPersoneria(codigo);
  await pool.query(`UPDATE fin_personeria SET "PERS_DESC" = $1 WHERE "PERS_CODIGO" = $2`, [data.pers_desc, codigo]);
  return getPersoneria(codigo);
};

const deletePersoneria = async (codigo) => {
  await pool.query('DELETE FROM fin_personeria WHERE "PERS_CODIGO" = $1', [codigo]);
};

// ─── CLASES DE DOCUMENTO ─────────────────────────────────────────────────────

const getClasesDoc = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "CLDO_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fin_clase_doc ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"CLDO_CODIGO"', desc: '"CLDO_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"CLDO_DESC" ASC';
  const select = `SELECT "CLDO_CODIGO" AS cldo_codigo, "CLDO_DESC" AS cldo_desc FROM fin_clase_doc ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getClaseDoc = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "CLDO_CODIGO" AS cldo_codigo, "CLDO_DESC" AS cldo_desc FROM fin_clase_doc WHERE "CLDO_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Clase de documento no encontrada' };
  return rows[0];
};

const createClaseDoc = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("CLDO_CODIGO"), 0) + 1 AS next FROM fin_clase_doc');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO fin_clase_doc ("CLDO_CODIGO","CLDO_DESC") VALUES ($1,$2)`, [codigo, data.cldo_desc]);
  return getClaseDoc(codigo);
};

const updateClaseDoc = async (codigo, data) => {
  if (!data.cldo_desc) return getClaseDoc(codigo);
  await pool.query(`UPDATE fin_clase_doc SET "CLDO_DESC" = $1 WHERE "CLDO_CODIGO" = $2`, [data.cldo_desc, codigo]);
  return getClaseDoc(codigo);
};

const deleteClaseDoc = async (codigo) => {
  await pool.query('DELETE FROM fin_clase_doc WHERE "CLDO_CODIGO" = $1', [codigo]);
};

module.exports = {
  getBancos, getBanco, createBanco, updateBanco, deleteBanco,
  getFormasPago, getFormaPago, createFormaPago, updateFormaPago, deleteFormaPago,
  getRamos, getRamo, createRamo, updateRamo, deleteRamo,
  getTiposProveedor, getTipoProveedor, createTipoProveedor, updateTipoProveedor, deleteTipoProveedor,
  getPersonerias, getPersoneria, createPersoneria, updatePersoneria, deletePersoneria,
  getClasesDoc, getClaseDoc, createClaseDoc, updateClaseDoc, deleteClaseDoc,
};
