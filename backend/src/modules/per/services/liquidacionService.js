const pool = require('../../../config/db');

// ─── LIQUIDACIONES (per_documento) ──────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `AND (e."EMPL_NOMBRE" ILIKE $1 OR e."EMPL_APE" ILIKE $1 OR CAST(d."PDOC_EMPLEADO" AS TEXT) ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM per_documento d
     LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = d."PDOC_EMPLEADO"
     WHERE 1=1 ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    fecha:    'd."PDOC_FEC"',
    empleado: 'e."EMPL_NOMBRE"',
    periodo:  'd."PDOC_PERIODO"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'd."PDOC_CLAVE" DESC';
  const select = `
    SELECT d."PDOC_CLAVE"       AS pdoc_clave,
           d."PDOC_EMPLEADO"    AS pdoc_empleado,
           e."EMPL_NOMBRE"      AS empl_nombre,
           e."EMPL_APE"         AS empl_ape,
           d."PDOC_FEC"         AS pdoc_fec,
           d."PDOC_PERIODO"     AS pdoc_periodo,
           d."PDOC_QUINCENA"    AS pdoc_quincena,
           d."PDOC_NRO_DOC"     AS pdoc_nro_doc,
           d."PDOC_FEC_INI"     AS pdoc_fec_ini,
           d."PDOC_FEC_FIN"     AS pdoc_fec_fin,
           d."PDOC_PROCESADO"   AS pdoc_procesado,
           d."PDOC_OBS"         AS pdoc_obs
    FROM per_documento d
    LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = d."PDOC_EMPLEADO"
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

const getById = async (clave) => {
  const { rows } = await pool.query(
    `SELECT d."PDOC_CLAVE"       AS pdoc_clave,
            d."PDOC_EMPLEADO"    AS pdoc_empleado,
            e."EMPL_NOMBRE"      AS empl_nombre,
            e."EMPL_APE"         AS empl_ape,
            d."PDOC_FEC"         AS pdoc_fec,
            d."PDOC_PERIODO"     AS pdoc_periodo,
            d."PDOC_QUINCENA"    AS pdoc_quincena,
            d."PDOC_NRO_DOC"     AS pdoc_nro_doc,
            d."PDOC_FEC_INI"     AS pdoc_fec_ini,
            d."PDOC_FEC_FIN"     AS pdoc_fec_fin,
            d."PDOC_PROCESADO"   AS pdoc_procesado,
            d."PDOC_OBS"         AS pdoc_obs,
            d."PDOC_LOGIN"       AS pdoc_login,
            d."PDOC_FEC_GRAB"    AS pdoc_fec_grab
     FROM per_documento d
     LEFT JOIN per_empleado e ON e."EMPL_LEGAJO" = d."PDOC_EMPLEADO"
     WHERE d."PDOC_CLAVE" = $1`,
    [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Liquidación no encontrada' };

  const { rows: detalle } = await pool.query(
    `SELECT dd."PDDET_CLAVE_DOC"      AS pddet_clave_doc,
            dd."PDDET_ITEM"           AS pddet_item,
            dd."PDDET_CLAVE_CONCEPTO" AS pddet_clave_concepto,
            c."PCON_DESC"             AS concepto_desc,
            dd."PDDET_IMP"            AS pddet_imp,
            dd."PDDET_CANTIDAD"       AS pddet_cantidad,
            dd."PDDET_PORCENTAJE"     AS pddet_porcentaje,
            dd."PDDET_SALARIO_BASE"   AS pddet_salario_base,
            dd."PDDET_CANT_HS_EXTRAS" AS pddet_cant_hs_extras,
            dd."PDDET_PORC_HS_EXTRAS" AS pddet_porc_hs_extras
     FROM per_documento_det dd
     LEFT JOIN per_concepto c ON c."PCON_CLAVE" = dd."PDDET_CLAVE_CONCEPTO"
     WHERE dd."PDDET_CLAVE_DOC" = $1
     ORDER BY dd."PDDET_ITEM"`,
    [clave]
  );

  return { ...rows[0], detalle };
};

module.exports = { getAll, getById };
