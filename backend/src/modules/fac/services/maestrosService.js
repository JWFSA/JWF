const pool = require('../../../config/db');

// ─── ZONAS ───────────────────────────────────────────────────────────────────

const getZonas = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "ZONA_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_zona ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"ZONA_CODIGO"', desc: '"ZONA_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"ZONA_DESC" ASC';
  const select = `SELECT "ZONA_CODIGO" AS zona_codigo, "ZONA_DESC" AS zona_desc FROM fac_zona ${where} ORDER BY ${orderBy}`;
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

const getCategorias = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "FCAT_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_categoria ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"FCAT_CODIGO"', desc: '"FCAT_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"FCAT_CODIGO" ASC';
  const select = `SELECT "FCAT_CODIGO" AS fcat_codigo, "FCAT_DESC" AS fcat_desc, "FCAT_MON" AS fcat_mon,
    "FCAT_VENT_INI" AS fcat_vent_ini, "FCAT_VENT_FIN" AS fcat_vent_fin, "FCAT_ATRASO" AS fcat_atraso
    FROM fac_categoria ${where} ORDER BY ${orderBy}`;
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

const getVendedores = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE (o."OPER_NOMBRE" ILIKE $1 OR o."OPER_APELLIDO" ILIKE $1)` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_vendedor v JOIN gen_operador o ON o."OPER_CODIGO" = v."VEND_OPER" ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { leg: 'v."VEND_LEGAJO"', nom: 'o."OPER_NOMBRE"', ape: 'o."OPER_APELLIDO"', zona: 'z."ZONA_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'o."OPER_NOMBRE" ASC, o."OPER_APELLIDO" ASC';
  const select = `SELECT v."VEND_LEGAJO" AS vend_legajo, v."VEND_OPER" AS vend_oper,
    v."VEND_ZONA" AS vend_zona, z."ZONA_DESC" AS zona_desc,
    v."VEND_EMPR" AS vend_empr, e."EMPR_RAZON_SOCIAL" AS empr_razon_social,
    v."VEND_PORC_COMISION_VTA" AS vend_porc_comision_vta,
    o."OPER_NOMBRE" AS oper_nombre, o."OPER_APELLIDO" AS oper_apellido
    FROM fac_vendedor v
    JOIN gen_operador o ON o."OPER_CODIGO" = v."VEND_OPER"
    LEFT JOIN fac_zona z ON z."ZONA_CODIGO" = v."VEND_ZONA"
    LEFT JOIN gen_empresa e ON e."EMPR_CODIGO" = v."VEND_EMPR"
    ${where} ORDER BY ${orderBy}`;
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

const getListasPrecio = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "LIPE_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_lista_precio ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { nro: '"LIPE_NRO_LISTA_PRECIO"', desc: '"LIPE_DESC"', estado: '"LIPE_ESTADO"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"LIPE_NRO_LISTA_PRECIO" ASC';
  const select = `
    SELECT "LIPE_EMPR" AS lipe_empr, "LIPE_NRO_LISTA_PRECIO" AS lipe_nro_lista_precio,
           "LIPE_MON" AS lipe_mon, "LIPE_DESC" AS lipe_desc, "LIPE_ESTADO" AS lipe_estado
    FROM fac_lista_precio ${where} ORDER BY ${orderBy}`;
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

// ─── LISTA DE PRECIO — DETALLE ───────────────────────────────────────────────

const getListaPrecioItems = async (listaId, { page = 1, limit = 20, search = '', all = false } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const where = search
    ? `WHERE d."LIPR_NRO_LISTA_PRECIO" = $1 AND d."LIPR_EMPR" = 1 AND a."ART_DESC" ILIKE $2`
    : `WHERE d."LIPR_NRO_LISTA_PRECIO" = $1 AND d."LIPR_EMPR" = 1`;
  const params = search ? [listaId, `%${search}%`] : [listaId];
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM fac_lista_precio_det d
     JOIN stk_articulo a ON a."ART_CODIGO" = d."LIPR_ART" ${where}`, params
  );
  const total = parseInt(countRes.rows[0].count);
  const select = `
    SELECT d."LIPR_NRO_LISTA_PRECIO" AS lipr_nro_lista_precio,
           d."LIPR_ART" AS lipr_art,
           a."ART_DESC" AS art_desc,
           a."ART_UNID_MED" AS art_unid_med,
           d."LIPR_PRECIO_UNITARIO" AS lipr_precio_unitario,
           d."LIPR_DCTO" AS lipr_dcto,
           d."LIPR_DCTOB" AS lipr_dctob
    FROM fac_lista_precio_det d
    JOIN stk_articulo a ON a."ART_CODIGO" = d."LIPR_ART"
    ${where} ORDER BY a."ART_DESC"`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const upsertListaPrecioItem = async (listaId, data) => {
  const { lipr_art, lipr_precio_unitario, lipr_dcto = 0, lipr_dctob = 0 } = data;
  const { rows } = await pool.query(
    `SELECT 1 FROM fac_lista_precio_det WHERE "LIPR_EMPR" = 1 AND "LIPR_NRO_LISTA_PRECIO" = $1 AND "LIPR_ART" = $2`,
    [listaId, lipr_art]
  );
  if (rows.length) {
    await pool.query(
      `UPDATE fac_lista_precio_det SET "LIPR_PRECIO_UNITARIO" = $1, "LIPR_DCTO" = $2, "LIPR_DCTOB" = $3
       WHERE "LIPR_EMPR" = 1 AND "LIPR_NRO_LISTA_PRECIO" = $4 AND "LIPR_ART" = $5`,
      [lipr_precio_unitario, lipr_dcto, lipr_dctob, listaId, lipr_art]
    );
  } else {
    await pool.query(
      `INSERT INTO fac_lista_precio_det ("LIPR_EMPR","LIPR_NRO_LISTA_PRECIO","LIPR_ART","LIPR_PRECIO_UNITARIO","LIPR_DCTO","LIPR_DCTOB")
       VALUES (1,$1,$2,$3,$4,$5)`,
      [listaId, lipr_art, lipr_precio_unitario, lipr_dcto, lipr_dctob]
    );
  }
};

const deleteListaPrecioItem = async (listaId, artCodigo) => {
  await pool.query(
    `DELETE FROM fac_lista_precio_det WHERE "LIPR_EMPR" = 1 AND "LIPR_NRO_LISTA_PRECIO" = $1 AND "LIPR_ART" = $2`,
    [listaId, artCodigo]
  );
};

// ─── BARRIOS ─────────────────────────────────────────────────────────────────

const getBarrios = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "BA_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_barrio ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"BA_CODIGO"', desc: '"BA_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"BA_DESC" ASC';
  const select = `SELECT "BA_CODIGO" AS ba_codigo, "BA_DESC" AS ba_desc, "BA_LOCALIDAD" AS ba_localidad FROM fac_barrio ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getBarrio = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "BA_CODIGO" AS ba_codigo, "BA_DESC" AS ba_desc, "BA_LOCALIDAD" AS ba_localidad FROM fac_barrio WHERE "BA_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Barrio no encontrado' };
  return rows[0];
};

const createBarrio = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("BA_CODIGO"), 0) + 1 AS next FROM fac_barrio');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO fac_barrio ("BA_CODIGO","BA_DESC","BA_LOCALIDAD") VALUES ($1,$2,$3)`,
    [codigo, data.ba_desc, data.ba_localidad || null]);
  return getBarrio(codigo);
};

const updateBarrio = async (codigo, data) => {
  const fields = []; const params = [];
  const map = { ba_desc: '"BA_DESC"', ba_localidad: '"BA_LOCALIDAD"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getBarrio(codigo);
  params.push(codigo);
  await pool.query(`UPDATE fac_barrio SET ${fields.join(', ')} WHERE "BA_CODIGO" = $${params.length}`, params);
  return getBarrio(codigo);
};

const deleteBarrio = async (codigo) => {
  await pool.query('DELETE FROM fac_barrio WHERE "BA_CODIGO" = $1', [codigo]);
};

// ─── Agencias ──────────────────────────────────────────────────────────────
const getAgencias = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "AGEN_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_agencia ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"AGEN_CODIGO"', desc: '"AGEN_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : '"AGEN_DESC" ASC';
  const select = `SELECT "AGEN_CODIGO" AS agen_codigo, "AGEN_DESC" AS agen_desc, "AGEN_EST" AS agen_est FROM fac_agencia ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getAgencia = async (codigo) => {
  const { rows } = await pool.query(`SELECT "AGEN_CODIGO" AS agen_codigo, "AGEN_DESC" AS agen_desc, "AGEN_EST" AS agen_est FROM fac_agencia WHERE "AGEN_CODIGO" = $1`, [codigo]);
  if (!rows.length) throw { status: 404, message: 'Agencia no encontrada' };
  return rows[0];
};

const createAgencia = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("AGEN_CODIGO"), 0) + 1 AS next FROM fac_agencia');
  const codigo = rows[0].next;
  await pool.query(`INSERT INTO fac_agencia ("AGEN_CODIGO","AGEN_DESC","AGEN_EST") VALUES ($1,$2,$3)`, [codigo, data.agen_desc, data.agen_est || 'A']);
  return getAgencia(codigo);
};

const updateAgencia = async (codigo, data) => {
  const fields = []; const params = [];
  if (data.agen_desc !== undefined) { params.push(data.agen_desc); fields.push(`"AGEN_DESC" = $${params.length}`); }
  if (data.agen_est !== undefined) { params.push(data.agen_est); fields.push(`"AGEN_EST" = $${params.length}`); }
  if (fields.length) {
    params.push(codigo);
    await pool.query(`UPDATE fac_agencia SET ${fields.join(', ')} WHERE "AGEN_CODIGO" = $${params.length}`, params);
  }
  return getAgencia(codigo);
};

const deleteAgencia = async (codigo) => {
  await pool.query('DELETE FROM fac_agencia WHERE "AGEN_CODIGO" = $1', [codigo]);
};

module.exports = {
  getZonas, getZona, createZona, updateZona, deleteZona,
  getCategorias, getCategoria, createCategoria, updateCategoria, deleteCategoria,
  getCondiciones, createCondicion, deleteCondicion,
  getVendedores, getVendedor, createVendedor, updateVendedor, deleteVendedor,
  getListasPrecio, getListaPrecio, createListaPrecio, updateListaPrecio, deleteListaPrecio,
  getListaPrecioItems, upsertListaPrecioItem, deleteListaPrecioItem,
  getBarrios, getBarrio, createBarrio, updateBarrio, deleteBarrio,
  getAgencias, getAgencia, createAgencia, updateAgencia, deleteAgencia,
};
