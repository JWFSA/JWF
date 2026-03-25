const pool = require('../../../config/db');

// ─── ZONAS ───────────────────────────────────────────────────────────────────

const getZonas = async ({ page = 1, limit = 20, search = '', all = false } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "ZONA_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_zona ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const select = `SELECT "ZONA_CODIGO" AS zona_codigo, "ZONA_DESC" AS zona_desc FROM fac_zona ${where} ORDER BY "ZONA_DESC"`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getZona = async (codigo) => {
  const { rows } = await pool.query(`SELECT "ZONA_CODIGO" AS zona_codigo, "ZONA_DESC" AS zona_desc FROM fac_zona WHERE "ZONA_CODIGO" = $1`, [codigo]);
  if (!rows.length) throw { status: 404, message: 'Zona no encontrada' };
  return rows[0];
};

const createZona = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("ZONA_CODIGO"), 0) + 1 AS next FROM fac_zona');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO fac_zona ("ZONA_CODIGO","ZONA_DESC") VALUES ($1,$2)`, [codigo, data.zona_desc]);
  return getZona(codigo);
};

const updateZona = async (codigo, data) => {
  await pool.query('UPDATE fac_zona SET "ZONA_DESC" = $1 WHERE "ZONA_CODIGO" = $2', [data.zona_desc, codigo]);
  return getZona(codigo);
};

const deleteZona = async (codigo) => {
  await pool.query('DELETE FROM fac_zona WHERE "ZONA_CODIGO" = $1', [codigo]);
};

// ─── CATEGORÍAS ──────────────────────────────────────────────────────────────

const getCategorias = async ({ page = 1, limit = 20, search = '', all = false } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "FCAT_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_categoria ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const select = `SELECT "FCAT_CODIGO" AS fcat_codigo, "FCAT_DESC" AS fcat_desc, "FCAT_MON" AS fcat_mon,
    "FCAT_VENT_INI" AS fcat_vent_ini, "FCAT_VENT_FIN" AS fcat_vent_fin, "FCAT_ATRASO" AS fcat_atraso
    FROM fac_categoria ${where} ORDER BY "FCAT_CODIGO"`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getCategoria = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "FCAT_CODIGO" AS fcat_codigo, "FCAT_DESC" AS fcat_desc, "FCAT_MON" AS fcat_mon,
     "FCAT_VENT_INI" AS fcat_vent_ini, "FCAT_VENT_FIN" AS fcat_vent_fin, "FCAT_ATRASO" AS fcat_atraso
     FROM fac_categoria WHERE "FCAT_CODIGO" = $1`, [codigo]);
  if (!rows.length) throw { status: 404, message: 'Categoría no encontrada' };
  return rows[0];
};

const createCategoria = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("FCAT_CODIGO"), 0) + 1 AS next FROM fac_categoria');
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO fac_categoria ("FCAT_CODIGO","FCAT_DESC","FCAT_MON","FCAT_VENT_INI","FCAT_VENT_FIN","FCAT_ATRASO")
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [codigo, data.fcat_desc, data.fcat_mon || null, data.fcat_vent_ini || 0, data.fcat_vent_fin || 0, data.fcat_atraso || 0]
  );
  return getCategoria(codigo);
};

const updateCategoria = async (codigo, data) => {
  const fields = []; const params = [];
  const map = { fcat_desc: '"FCAT_DESC"', fcat_mon: '"FCAT_MON"', fcat_vent_ini: '"FCAT_VENT_INI"', fcat_vent_fin: '"FCAT_VENT_FIN"', fcat_atraso: '"FCAT_ATRASO"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getCategoria(codigo);
  params.push(codigo);
  await pool.query(`UPDATE fac_categoria SET ${fields.join(', ')} WHERE "FCAT_CODIGO" = $${params.length}`, params);
  return getCategoria(codigo);
};

const deleteCategoria = async (codigo) => {
  await pool.query('DELETE FROM fac_categoria WHERE "FCAT_CODIGO" = $1', [codigo]);
};

// ─── CONDICIONES DE VENTA ────────────────────────────────────────────────────
// PK = CON_DESC (texto, no auto-numérico)

const getCondiciones = async () => {
  const { rows } = await pool.query(`SELECT "CON_DESC" AS con_desc FROM fac_condiciones ORDER BY "CON_DESC"`);
  return rows;
};

const createCondicion = async (data) => {
  await pool.query(`INSERT INTO fac_condiciones ("CON_DESC") VALUES ($1)`, [data.con_desc]);
  return { con_desc: data.con_desc };
};

const deleteCondicion = async (desc) => {
  await pool.query(`DELETE FROM fac_condiciones WHERE "CON_DESC" = $1`, [desc]);
};

// ─── VENDEDORES ──────────────────────────────────────────────────────────────

const getVendedores = async ({ page = 1, limit = 20, search = '', all = false } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE (o."OPER_NOMBRE" ILIKE $1 OR o."OPER_APELLIDO" ILIKE $1)` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_vendedor v JOIN gen_operador o ON o."OPER_CODIGO" = v."VEND_OPER" ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const select = `SELECT v."VEND_LEGAJO" AS vend_legajo, v."VEND_OPER" AS vend_oper,
    v."VEND_ZONA" AS vend_zona, z."ZONA_DESC" AS zona_desc,
    v."VEND_EMPR" AS vend_empr, e."EMPR_RAZON_SOCIAL" AS empr_razon_social,
    v."VEND_PORC_COMISION_VTA" AS vend_porc_comision_vta,
    o."OPER_NOMBRE" AS oper_nombre, o."OPER_APELLIDO" AS oper_apellido
    FROM fac_vendedor v
    JOIN gen_operador o ON o."OPER_CODIGO" = v."VEND_OPER"
    LEFT JOIN fac_zona z ON z."ZONA_CODIGO" = v."VEND_ZONA"
    LEFT JOIN gen_empresa e ON e."EMPR_CODIGO" = v."VEND_EMPR"
    ${where} ORDER BY o."OPER_NOMBRE", o."OPER_APELLIDO"`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getVendedor = async (legajo) => {
  const { rows } = await pool.query(
    `SELECT v."VEND_LEGAJO" AS vend_legajo, v."VEND_OPER" AS vend_oper,
     v."VEND_ZONA" AS vend_zona, z."ZONA_DESC" AS zona_desc,
     v."VEND_EMPR" AS vend_empr, e."EMPR_RAZON_SOCIAL" AS empr_razon_social,
     v."VEND_PORC_COMISION_VTA" AS vend_porc_comision_vta,
     o."OPER_NOMBRE" AS oper_nombre, o."OPER_APELLIDO" AS oper_apellido
     FROM fac_vendedor v
     JOIN gen_operador o ON o."OPER_CODIGO" = v."VEND_OPER"
     LEFT JOIN fac_zona z ON z."ZONA_CODIGO" = v."VEND_ZONA"
     LEFT JOIN gen_empresa e ON e."EMPR_CODIGO" = v."VEND_EMPR"
     WHERE v."VEND_LEGAJO" = $1`, [legajo]);
  if (!rows.length) throw { status: 404, message: 'Vendedor no encontrado' };
  return rows[0];
};

const createVendedor = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("VEND_LEGAJO"), 0) + 1 AS next FROM fac_vendedor');
  const legajo = rows[0].next;
  await pool.query(
    `INSERT INTO fac_vendedor ("VEND_LEGAJO","VEND_OPER","VEND_ZONA","VEND_EMPR","VEND_PORC_COMISION_VTA")
     VALUES ($1,$2,$3,$4,$5)`,
    [legajo, data.vend_oper, data.vend_zona || null, data.vend_empr || null, data.vend_porc_comision_vta || 0]
  );
  return getVendedor(legajo);
};

const updateVendedor = async (legajo, data) => {
  const fields = []; const params = [];
  const map = { vend_zona: '"VEND_ZONA"', vend_empr: '"VEND_EMPR"', vend_porc_comision_vta: '"VEND_PORC_COMISION_VTA"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getVendedor(legajo);
  params.push(legajo);
  await pool.query(`UPDATE fac_vendedor SET ${fields.join(', ')} WHERE "VEND_LEGAJO" = $${params.length}`, params);
  return getVendedor(legajo);
};

const deleteVendedor = async (legajo) => {
  await pool.query('DELETE FROM fac_vendedor WHERE "VEND_LEGAJO" = $1', [legajo]);
};

// ─── LISTAS DE PRECIO ────────────────────────────────────────────────────────

const getListasPrecio = async ({ page = 1, limit = 20, search = '', all = false } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "LIPE_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_lista_precio ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const select = `
    SELECT "LIPE_EMPR" AS lipe_empr, "LIPE_NRO_LISTA_PRECIO" AS lipe_nro_lista_precio,
           "LIPE_MON" AS lipe_mon, "LIPE_DESC" AS lipe_desc, "LIPE_ESTADO" AS lipe_estado
    FROM fac_lista_precio ${where} ORDER BY "LIPE_NRO_LISTA_PRECIO"`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getListaPrecio = async (nro) => {
  const { rows } = await pool.query(
    `SELECT "LIPE_EMPR" AS lipe_empr, "LIPE_NRO_LISTA_PRECIO" AS lipe_nro_lista_precio,
     "LIPE_MON" AS lipe_mon, "LIPE_DESC" AS lipe_desc, "LIPE_ESTADO" AS lipe_estado
     FROM fac_lista_precio WHERE "LIPE_EMPR" = 1 AND "LIPE_NRO_LISTA_PRECIO" = $1`,
    [nro]
  );
  if (!rows.length) throw { status: 404, message: 'Lista de precio no encontrada' };
  return rows[0];
};

const createListaPrecio = async (data) => {
  const { rows } = await pool.query(
    `SELECT COALESCE(MAX("LIPE_NRO_LISTA_PRECIO"), 0) + 1 AS next FROM fac_lista_precio WHERE "LIPE_EMPR" = 1`
  );
  const nro = rows[0].next;
  await pool.query(
    `INSERT INTO fac_lista_precio ("LIPE_EMPR","LIPE_NRO_LISTA_PRECIO","LIPE_MON","LIPE_DESC","LIPE_ESTADO")
     VALUES ($1,$2,$3,$4,$5)`,
    [1, nro, data.lipe_mon || null, data.lipe_desc, data.lipe_estado || 'A']
  );
  return getListaPrecio(nro);
};

const updateListaPrecio = async (nro, data) => {
  const fields = []; const params = [];
  const map = { lipe_mon: '"LIPE_MON"', lipe_desc: '"LIPE_DESC"', lipe_estado: '"LIPE_ESTADO"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getListaPrecio(nro);
  params.push(nro);
  await pool.query(
    `UPDATE fac_lista_precio SET ${fields.join(', ')} WHERE "LIPE_EMPR" = 1 AND "LIPE_NRO_LISTA_PRECIO" = $${params.length}`,
    params
  );
  return getListaPrecio(nro);
};

const deleteListaPrecio = async (nro) => {
  await pool.query(
    `DELETE FROM fac_lista_precio WHERE "LIPE_EMPR" = 1 AND "LIPE_NRO_LISTA_PRECIO" = $1`,
    [nro]
  );
};

module.exports = {
  getZonas, getZona, createZona, updateZona, deleteZona,
  getCategorias, getCategoria, createCategoria, updateCategoria, deleteCategoria,
  getCondiciones, createCondicion, deleteCondicion,
  getVendedores, getVendedor, createVendedor, updateVendedor, deleteVendedor,
  getListasPrecio, getListaPrecio, createListaPrecio, updateListaPrecio, deleteListaPrecio,
};
