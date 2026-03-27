const pool = require('../../../config/db');

// ─── CARGOS ───────────────────────────────────────────────────────────────────

const getCargos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "CAR_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_cargo ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"CAR_DESC" ${dir}` : `"CAR_CODIGO" ${dir}`;
  const select = `SELECT "CAR_CODIGO" AS car_codigo, "CAR_DESC" AS car_desc FROM per_cargo ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createCargo = async ({ car_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("CAR_CODIGO"), 0) + 1 AS next FROM per_cargo`);
  await pool.query(`INSERT INTO per_cargo ("CAR_CODIGO","CAR_DESC") VALUES ($1,$2)`, [next, car_desc]);
  return { car_codigo: next, car_desc };
};

const updateCargo = async (id, { car_desc }) => {
  await pool.query(`UPDATE per_cargo SET "CAR_DESC" = $1 WHERE "CAR_CODIGO" = $2`, [car_desc, id]);
  return { car_codigo: id, car_desc };
};

const deleteCargo = async (id) => {
  await pool.query(`DELETE FROM per_cargo WHERE "CAR_CODIGO" = $1`, [id]);
};

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

const getCategorias = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PCAT_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_categoria ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"PCAT_DESC" ${dir}` : `"PCAT_CODIGO" ${dir}`;
  const select = `SELECT "PCAT_CODIGO" AS pcat_codigo, "PCAT_DESC" AS pcat_desc FROM per_categoria ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createCategoria = async ({ pcat_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PCAT_CODIGO"), 0) + 1 AS next FROM per_categoria`);
  await pool.query(`INSERT INTO per_categoria ("PCAT_CODIGO","PCAT_DESC") VALUES ($1,$2)`, [next, pcat_desc]);
  return { pcat_codigo: next, pcat_desc };
};

const updateCategoria = async (id, { pcat_desc }) => {
  await pool.query(`UPDATE per_categoria SET "PCAT_DESC" = $1 WHERE "PCAT_CODIGO" = $2`, [pcat_desc, id]);
  return { pcat_codigo: id, pcat_desc };
};

const deleteCategoria = async (id) => {
  await pool.query(`DELETE FROM per_categoria WHERE "PCAT_CODIGO" = $1`, [id]);
};

// ─── ÁREAS ────────────────────────────────────────────────────────────────────

const getAreas = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PER_AREA_DESC" ILIKE $1` : '';
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `per_area_desc ${dir}` : `per_area_cod ${dir}`;
  // Subquery para deduplicar por código antes de paginar/contar
  const base = `SELECT DISTINCT ON ("PER_AREA_COD") "PER_AREA_COD" AS per_area_cod, "PER_AREA_DESC" AS per_area_desc FROM per_area ${where} ORDER BY "PER_AREA_COD"`;
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM (${base}) sub`, params);
  const total = parseInt(count);
  const select = `SELECT * FROM (${base}) sub ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createArea = async ({ per_area_desc }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PER_AREA_COD"), 0) + 1 AS next FROM per_area`);
  await pool.query(`INSERT INTO per_area ("PER_AREA_COD","PER_AREA_DESC","PER_AREA_EMPRESA") VALUES ($1,$2,$3)`, [next, per_area_desc, 1]);
  return { per_area_cod: next, per_area_desc };
};

const updateArea = async (id, { per_area_desc }) => {
  await pool.query(`UPDATE per_area SET "PER_AREA_DESC" = $1 WHERE "PER_AREA_COD" = $2`, [per_area_desc, id]);
  return { per_area_cod: id, per_area_desc };
};

const deleteArea = async (id) => {
  await pool.query(`DELETE FROM per_area WHERE "PER_AREA_COD" = $1`, [id]);
};

// ─── SECCIONES ────────────────────────────────────────────────────────────────

const getSecciones = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "PER_SECC_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_seccion ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"PER_SECC_DESC" ${dir}` : `"PER_SECC_COD" ${dir}`;
  const select = `SELECT "PER_SECC_COD" AS per_secc_cod, "PER_SECC_DESC" AS per_secc_desc,
                         "PER_SECC_AREA" AS per_secc_area, "PER_SECC_AREA_DESC" AS per_secc_area_desc
                  FROM per_seccion ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createSeccion = async ({ per_secc_desc, per_secc_area }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("PER_SECC_COD"), 0) + 1 AS next FROM per_seccion`);
  await pool.query(
    `INSERT INTO per_seccion ("PER_SECC_COD","PER_SECC_DESC","PER_SECC_AREA","PER_SECC_EMPRESA") VALUES ($1,$2,$3,$4)`,
    [next, per_secc_desc, per_secc_area || null, 1]
  );
  return { per_secc_cod: next, per_secc_desc };
};

const updateSeccion = async (id, { per_secc_desc, per_secc_area }) => {
  await pool.query(
    `UPDATE per_seccion SET "PER_SECC_DESC" = $1, "PER_SECC_AREA" = $2 WHERE "PER_SECC_COD" = $3`,
    [per_secc_desc, per_secc_area || null, id]
  );
  return { per_secc_cod: id, per_secc_desc };
};

const deleteSeccion = async (id) => {
  await pool.query(`DELETE FROM per_seccion WHERE "PER_SECC_COD" = $1`, [id]);
};

// ─── TURNOS ───────────────────────────────────────────────────────────────────

const getTurnos = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "TUR_DESC" ILIKE $1` : '';
  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM per_turno ${where}`, params);
  const total = parseInt(count);
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortField === 'desc' ? `"TUR_DESC" ${dir}` : `"TUR_CODIGO" ${dir}`;
  const select = `SELECT "TUR_CODIGO" AS tur_codigo, "TUR_DESC" AS tur_desc, "TUR_ESTADO" AS tur_estado FROM per_turno ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createTurno = async ({ tur_desc, tur_estado }) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("TUR_CODIGO"), 0) + 1 AS next FROM per_turno`);
  await pool.query(`INSERT INTO per_turno ("TUR_CODIGO","TUR_DESC","TUR_EMPRESA","TUR_ESTADO") VALUES ($1,$2,$3,$4)`, [next, tur_desc, 1, tur_estado || 'A']);
  return { tur_codigo: next, tur_desc, tur_estado: tur_estado || 'A' };
};

const updateTurno = async (id, { tur_desc, tur_estado }) => {
  await pool.query(`UPDATE per_turno SET "TUR_DESC" = $1, "TUR_ESTADO" = $2 WHERE "TUR_CODIGO" = $3`, [tur_desc, tur_estado || 'A', id]);
  return { tur_codigo: id, tur_desc, tur_estado };
};

const deleteTurno = async (id) => {
  await pool.query(`DELETE FROM per_turno WHERE "TUR_CODIGO" = $1`, [id]);
};

module.exports = {
  getCargos, createCargo, updateCargo, deleteCargo,
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  getAreas, createArea, updateArea, deleteArea,
  getSecciones, createSeccion, updateSeccion, deleteSeccion,
  getTurnos, createTurno, updateTurno, deleteTurno,
};
