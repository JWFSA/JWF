const pool = require('../../../config/db');

// ─── CONCEPTOS FIJOS POR EMPLEADO ───────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `AND (e."EMPL_NOMBRE" ILIKE $1 OR e."EMPL_APE" ILIKE $1 OR c."PCON_DESC" ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM per_empl_conc ec
     LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = ec."PERCON_EMPLEADO"
     LEFT JOIN per_concepto c ON c."PCON_CLAVE" = ec."PERCON_CONCEPTO"
     WHERE 1=1 ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    empleado: 'e."EMPL_NOMBRE"',
    concepto: 'c."PCON_DESC"',
    importe:  'ec."PERCON_IMP"',
    fecha:    'ec."PERCON_FEC_PAGO"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'e."EMPL_NOMBRE" ASC';
  const select = `
    SELECT ec."PERCON_EMPLEADO"   AS percon_empleado,
           e."EMPL_NOMBRE"       AS empl_nombre,
           e."EMPL_APE"          AS empl_ape,
           ec."PERCON_CONCEPTO"  AS percon_concepto,
           c."PCON_DESC"         AS concepto_desc,
           ec."PERCON_IMP"       AS percon_imp,
           ec."PERCON_FEC_PAGO"  AS percon_fec_pago,
           ec."PERCON_FEC_VTO"   AS percon_fec_vto,
           ec."PERCON_GENERA"    AS percon_genera,
           ec."PERCON_CUOTA"     AS percon_cuota
    FROM per_empl_conc ec
    LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = ec."PERCON_EMPLEADO"
    LEFT JOIN per_concepto c ON c."PCON_CLAVE" = ec."PERCON_CONCEPTO"
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
