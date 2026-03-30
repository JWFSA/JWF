const pool = require('../../../config/db');

// ─── SOLICITUDES DE DESCUENTO ───────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (CAST(s."SOD_NRO" AS TEXT) ILIKE $1 OR s."SOD_LOGIN_SOL" ILIKE $1)`
    : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_solicitud_descuento s ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nro:   's."SOD_NRO"',
    fecha: 's."SOD_FECHA_SOL"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 's."SOD_CLAVE" DESC';
  const select = `
    SELECT s."SOD_CLAVE"     AS sod_clave,
           s."SOD_NRO"       AS sod_nro,
           s."SOD_CLAVE_PED" AS sod_clave_ped,
           s."SOD_FECHA_SOL" AS sod_fecha_sol,
           s."SOD_LOGIN_SOL" AS sod_login_sol,
           (SELECT COUNT(*) FROM fac_solicitud_descuento_det d WHERE d."SODE_CLAVE" = s."SOD_CLAVE") AS cant_items
    FROM fac_solicitud_descuento s
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

const getById = async (clave) => {
  const { rows } = await pool.query(
    `SELECT s."SOD_CLAVE"     AS sod_clave,
            s."SOD_NRO"       AS sod_nro,
            s."SOD_CLAVE_PED" AS sod_clave_ped,
            s."SOD_FECHA_SOL" AS sod_fecha_sol,
            s."SOD_FEC_GRAB"  AS sod_fec_grab,
            s."SOD_LOGIN_SOL" AS sod_login_sol
     FROM fac_solicitud_descuento s
     WHERE s."SOD_CLAVE" = $1`,
    [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Solicitud no encontrada' };

  const { rows: detalle } = await pool.query(
    `SELECT d."SODE_CLAVE"           AS sode_clave,
            d."SODE_ITEM"            AS sode_item,
            d."SODE_ART"             AS sode_art,
            a."ART_DESC"             AS art_desc,
            d."SODE_DCTO_SOL"        AS sode_dcto_sol,
            d."SODE_DCTO_APROB"      AS sode_dcto_aprob,
            d."SODE_ESTADO"          AS sode_estado,
            d."SODE_FEC_EST"         AS sode_fec_est,
            d."SODE_USER_EST"        AS sode_user_est,
            d."SODE_IMP_SOL"         AS sode_imp_sol,
            d."SODE_IMP_APROB"       AS sode_imp_aprob,
            d."SODE_IMP_NETO_ANT"    AS sode_imp_neto_ant,
            d."SODE_IMP_NETO_FINAL"  AS sode_imp_neto_final
     FROM fac_solicitud_descuento_det d
     LEFT JOIN stk_articulo a ON a."ART_CODIGO" = d."SODE_ART"
     WHERE d."SODE_CLAVE" = $1
     ORDER BY d."SODE_ITEM"`,
    [clave]
  );

  return { ...rows[0], detalle };
};

module.exports = { getAll, getById };
