const pool = require('../../../config/db');

// ─── HORARIOS DE EMPLEADOS ──────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc', empleado = '' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = [];
  let where = 'WHERE 1=1';
  if (empleado) { params.push(Number(empleado)); where += ` AND h."EMPLH_LEGAJO" = $${params.length}`; }
  if (search) { params.push(`%${search}%`); where += ` AND (e."EMPL_NOMBRE" ILIKE $${params.length} OR e."EMPL_APE" ILIKE $${params.length} OR h."EMPLH_DIA" ILIKE $${params.length})`; }

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM per_empl_horario h LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = h."EMPLH_LEGAJO" ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    empleado: 'e."EMPL_NOMBRE"',
    dia:      'h."EMPLH_DIA"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'h."EMPLH_LEGAJO" ASC, h."EMPLH_ITEM" ASC';
  const select = `
    SELECT h."EMPLH_LEGAJO"   AS emplh_legajo,
           e."EMPL_NOMBRE"    AS empl_nombre,
           e."EMPL_APE"       AS empl_ape,
           h."EMPLH_ITEM"     AS emplh_item,
           h."EMPLH_DIA"      AS emplh_dia,
           h."EMPLH_HORA_INI" AS emplh_hora_ini,
           h."EMPLH_HORA_FIN" AS emplh_hora_fin
    FROM per_empl_horario h
    LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = h."EMPLH_LEGAJO"
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
