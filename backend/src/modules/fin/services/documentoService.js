const pool = require('../../../config/db');

// ─── DOCUMENTOS FINANCIEROS ─────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `AND (d."DOC_CLI_NOM" ILIKE $1 OR CAST(d."DOC_NRO_DOC" AS TEXT) ILIKE $1 OR d."DOC_OBS" ILIKE $1 OR p."PROV_RAZON_SOCIAL" ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM fin_documento d
     LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = d."DOC_PROV"
     WHERE d."DOC_EMPR" = 1 ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nro:    'd."DOC_NRO_DOC"',
    fecha:  'd."DOC_FEC_DOC"',
    prov:   'p."PROV_RAZON_SOCIAL"',
    total:  'd."DOC_SALDO_MON"',
    tipo:   'd."DOC_TIPO_MOV"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'd."DOC_CLAVE" DESC';
  const select = `
    SELECT d."DOC_CLAVE"          AS doc_clave,
           d."DOC_TIPO_MOV"       AS doc_tipo_mov,
           t."TMOV_DESC"          AS tmov_desc,
           d."DOC_NRO_DOC"        AS doc_nro_doc,
           d."DOC_TIPO_SALDO"     AS doc_tipo_saldo,
           d."DOC_FEC_DOC"        AS doc_fec_doc,
           d."DOC_FEC_OPER"       AS doc_fec_oper,
           d."DOC_PROV"           AS doc_prov,
           p."PROV_RAZON_SOCIAL"  AS prov_nom,
           d."DOC_CLI"            AS doc_cli,
           d."DOC_CLI_NOM"        AS doc_cli_nom,
           d."DOC_MON"            AS doc_mon,
           m."MON_DESC"           AS mon_desc,
           d."DOC_NETO_EXEN_MON"  AS doc_neto_exen_mon,
           d."DOC_NETO_GRAV_MON"  AS doc_neto_grav_mon,
           d."DOC_IVA_MON"        AS doc_iva_mon,
           d."DOC_SALDO_MON"      AS doc_saldo_mon,
           d."DOC_SALDO_LOC"      AS doc_saldo_loc,
           d."DOC_OBS"            AS doc_obs
    FROM fin_documento d
    LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = d."DOC_PROV"
    LEFT JOIN gen_moneda    m ON m."MON_CODIGO"  = d."DOC_MON"
    LEFT JOIN gen_tipo_mov  t ON t."TMOV_CODIGO" = d."DOC_TIPO_MOV"
    WHERE d."DOC_EMPR" = 1 ${where}
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
    `SELECT d."DOC_CLAVE"          AS doc_clave,
            d."DOC_EMPR"           AS doc_empr,
            d."DOC_SUC"            AS doc_suc,
            d."DOC_TIPO_MOV"       AS doc_tipo_mov,
            t."TMOV_DESC"          AS tmov_desc,
            d."DOC_NRO_DOC"        AS doc_nro_doc,
            d."DOC_SERIE"          AS doc_serie,
            d."DOC_TIPO_SALDO"     AS doc_tipo_saldo,
            d."DOC_FEC_DOC"        AS doc_fec_doc,
            d."DOC_FEC_OPER"       AS doc_fec_oper,
            d."DOC_PROV"           AS doc_prov,
            p."PROV_RAZON_SOCIAL"  AS prov_nom,
            d."DOC_CLI"            AS doc_cli,
            d."DOC_CLI_NOM"        AS doc_cli_nom,
            d."DOC_CLI_RUC"        AS doc_cli_ruc,
            d."DOC_MON"            AS doc_mon,
            m."MON_DESC"           AS mon_desc,
            d."DOC_TASA"           AS doc_tasa,
            d."DOC_NETO_EXEN_LOC"  AS doc_neto_exen_loc,
            d."DOC_NETO_EXEN_MON"  AS doc_neto_exen_mon,
            d."DOC_NETO_GRAV_LOC"  AS doc_neto_grav_loc,
            d."DOC_NETO_GRAV_MON"  AS doc_neto_grav_mon,
            d."DOC_IVA_LOC"        AS doc_iva_loc,
            d."DOC_IVA_MON"        AS doc_iva_mon,
            d."DOC_SALDO_LOC"      AS doc_saldo_loc,
            d."DOC_SALDO_MON"      AS doc_saldo_mon,
            d."DOC_OBS"            AS doc_obs,
            d."DOC_COND_VTA"       AS doc_cond_vta,
            d."DOC_NRO_TIMBRADO"   AS doc_nro_timbrado,
            d."DOC_LOGIN"          AS doc_login,
            d."DOC_FEC_GRAB"       AS doc_fec_grab
     FROM fin_documento d
     LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = d."DOC_PROV"
     LEFT JOIN gen_moneda    m ON m."MON_CODIGO"  = d."DOC_MON"
     LEFT JOIN gen_tipo_mov  t ON t."TMOV_CODIGO" = d."DOC_TIPO_MOV"
     WHERE d."DOC_CLAVE" = $1`,
    [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Documento no encontrado' };

  // Conceptos del documento
  const { rows: conceptos } = await pool.query(
    `SELECT dc."DCON_CLAVE_DOC"      AS dcon_clave_doc,
            dc."DCON_ITEM"           AS dcon_item,
            dc."DCON_CLAVE_CONCEPTO" AS dcon_clave_concepto,
            fc."FCON_DESC"           AS concepto_desc,
            dc."DCON_TIPO_SALDO"     AS dcon_tipo_saldo,
            dc."DCON_EXEN_LOC"       AS dcon_exen_loc,
            dc."DCON_EXEN_MON"       AS dcon_exen_mon,
            dc."DCON_GRAV_LOC"       AS dcon_grav_loc,
            dc."DCON_GRAV_MON"       AS dcon_grav_mon,
            dc."DCON_IVA_LOC"        AS dcon_iva_loc,
            dc."DCON_IVA_MON"        AS dcon_iva_mon,
            dc."DCON_PORC_IVA"       AS dcon_porc_iva
     FROM fin_doc_concepto dc
     LEFT JOIN fin_concepto fc ON fc."FCON_CLAVE" = dc."DCON_CLAVE_CONCEPTO"
     WHERE dc."DCON_CLAVE_DOC" = $1
     ORDER BY dc."DCON_ITEM"`,
    [clave]
  );

  // Cuotas del documento
  const { rows: cuotas } = await pool.query(
    `SELECT "CUO_CLAVE_DOC"  AS cuo_clave_doc,
            "CUO_FEC_VTO"    AS cuo_fec_vto,
            "CUO_IMP_LOC"    AS cuo_imp_loc,
            "CUO_IMP_MON"    AS cuo_imp_mon,
            "CUO_SALDO_LOC"  AS cuo_saldo_loc,
            "CUO_SALDO_MON"  AS cuo_saldo_mon
     FROM fin_cuota
     WHERE "CUO_CLAVE_DOC" = $1
     ORDER BY "CUO_FEC_VTO"`,
    [clave]
  );

  return { ...rows[0], conceptos, cuotas };
};

module.exports = { getAll, getById };
