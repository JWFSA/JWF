const pool = require('../../../config/db');

// ─── STOCK ACTUAL (stk_articulo_deposito) ────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, dep = null, sortField = '', sortDir = 'asc' } = {}) => {
  const params = [];
  const conditions = [];

  if (search) { params.push(`%${search}%`); conditions.push(`(a."ART_DESC" ILIKE $${params.length} OR a."ART_CODIGO_FABRICA" ILIKE $${params.length})`); }
  if (dep)    { params.push(dep);            conditions.push(`s."ARDE_DEP" = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM stk_articulo_deposito s
     LEFT JOIN stk_articulo a ON a."ART_CODIGO" = s."ARDE_ART"
     LEFT JOIN stk_deposito  d ON d."DEP_EMPR" = s."ARDE_EMPR" AND d."DEP_SUC" = s."ARDE_SUC" AND d."DEP_CODIGO" = s."ARDE_DEP"
     ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);

  const allowedSort = {
    art:    'a."ART_DESC"',
    dep:    'd."DEP_DESC"',
    stock:  's."ARDE_CANT_ACT"',
    ent:    's."ARDE_CANT_ENT"',
    sal:    's."ARDE_CANT_SAL"',
    ubic:   's."ARDE_UBIC"',
  };
  const dir     = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'a."ART_DESC" ASC';

  const select = `
    SELECT s."ARDE_EMPR" AS arde_empr, s."ARDE_SUC" AS arde_suc, s."ARDE_DEP" AS arde_dep,
           s."ARDE_ART" AS arde_art, a."ART_DESC" AS art_desc,
           a."ART_CODIGO_FABRICA" AS art_codigo_fabrica, a."ART_UNID_MED" AS art_unid_med,
           d."DEP_DESC" AS dep_desc,
           s."ARDE_CANT_ACT" AS arde_cant_act, s."ARDE_CANT_ENT" AS arde_cant_ent,
           s."ARDE_CANT_SAL" AS arde_cant_sal, s."ARDE_UBIC" AS arde_ubic
    FROM stk_articulo_deposito s
    LEFT JOIN stk_articulo a ON a."ART_CODIGO" = s."ARDE_ART"
    LEFT JOIN stk_deposito  d ON d."DEP_EMPR" = s."ARDE_EMPR" AND d."DEP_SUC" = s."ARDE_SUC" AND d."DEP_CODIGO" = s."ARDE_DEP"
    ${where} ORDER BY ${orderBy}`;

  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

module.exports = { getAll };
