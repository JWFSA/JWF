const pool = require('../../../config/db');

// ─── AUSENCIAS ──────────────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `AND (e."EMPL_NOMBRE" ILIKE $1 OR e."EMPL_APE" ILIKE $1 OR a."AUS_OBS" ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM per_ausencias a
     LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = a."AUS_LEGAJO"
     WHERE 1=1 ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    fecha:    'a."AUS_FECHA"',
    empleado: 'e."EMPL_NOMBRE"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'a."AUS_FECHA" DESC';
  const select = `
    SELECT a."AUS_LEGAJO"           AS aus_legajo,
           e."EMPL_NOMBRE"          AS empl_nombre,
           e."EMPL_APE"             AS empl_ape,
           a."AUS_FECHA"            AS aus_fecha,
           a."AUS_EVENTO"           AS aus_evento,
           a."AUS_MOTIVO"           AS aus_motivo,
           m."MAUS_DESC"            AS motivo_desc,
           a."AUS_JUSTIFICADA"      AS aus_justificada,
           a."AUS_OBS"              AS aus_obs,
           a."AUS_IND_DESCUENTO"    AS aus_ind_descuento,
           a."AUS_IMPORTE_AUSENCIA" AS aus_importe_ausencia
    FROM per_ausencias a
    LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = a."AUS_LEGAJO"
    LEFT JOIN per_motivo_ausencia m ON m."MAUS_CLAVE" = a."AUS_MOTIVO"
    WHERE 1=1 ${where}
    ORDER BY ${orderBy}`;
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
