const pool = require('../../../config/db');

// ─── CHEQUES RECIBIDOS ──────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `AND (ch."CHEQ_NRO" ILIKE $1 OR ch."CHEQ_CLI_NOM" ILIKE $1 OR ch."CHEQ_TITULAR" ILIKE $1 OR ch."CHEQ_ORDEN" ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM fin_cheque ch WHERE ch."CHEQ_EMPR" = 1 ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nro:     'ch."CHEQ_NRO"',
    fecha:   'ch."CHEQ_FEC_EMIS"',
    banco:   'b."BCO_DESC"',
    importe: 'ch."CHEQ_IMPORTE"',
    vto:     'ch."CHEQ_FEC_DEPOSITAR"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'ch."CHEQ_CLAVE" DESC';
  const select = `
    SELECT ch."CHEQ_CLAVE"          AS cheq_clave,
           ch."CHEQ_SERIE"          AS cheq_serie,
           ch."CHEQ_NRO"            AS cheq_nro,
           ch."CHEQ_BCO"            AS cheq_bco,
           b."BCO_DESC"             AS bco_desc,
           ch."CHEQ_MON"            AS cheq_mon,
           m."MON_DESC"             AS mon_desc,
           ch."CHEQ_CLI"            AS cheq_cli,
           ch."CHEQ_CLI_NOM"        AS cheq_cli_nom,
           ch."CHEQ_TITULAR"        AS cheq_titular,
           ch."CHEQ_ORDEN"          AS cheq_orden,
           ch."CHEQ_FEC_EMIS"       AS cheq_fec_emis,
           ch."CHEQ_FEC_DEPOSITAR"  AS cheq_fec_depositar,
           ch."CHEQ_IMPORTE"        AS cheq_importe,
           ch."CHEQ_IMPORTE_LOC"    AS cheq_importe_loc,
           ch."CHEQ_SITUACION"      AS cheq_situacion,
           ch."CHEQ_OBS"            AS cheq_obs
    FROM fin_cheque ch
    LEFT JOIN fin_banco  b ON b."BCO_CODIGO" = ch."CHEQ_BCO"
    LEFT JOIN gen_moneda m ON m."MON_CODIGO" = ch."CHEQ_MON"
    WHERE ch."CHEQ_EMPR" = 1 ${where}
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
    `SELECT ch."CHEQ_CLAVE"          AS cheq_clave,
            ch."CHEQ_EMPR"           AS cheq_empr,
            ch."CHEQ_SERIE"          AS cheq_serie,
            ch."CHEQ_NRO"            AS cheq_nro,
            ch."CHEQ_SUC"            AS cheq_suc,
            ch."CHEQ_BCO"            AS cheq_bco,
            b."BCO_DESC"             AS bco_desc,
            ch."CHEQ_MON"            AS cheq_mon,
            m."MON_DESC"             AS mon_desc,
            ch."CHEQ_CLI"            AS cheq_cli,
            ch."CHEQ_CLI_NOM"        AS cheq_cli_nom,
            ch."CHEQ_TITULAR"        AS cheq_titular,
            ch."CHEQ_ORDEN"          AS cheq_orden,
            ch."CHEQ_FEC_EMIS"       AS cheq_fec_emis,
            ch."CHEQ_FEC_DEPOSITAR"  AS cheq_fec_depositar,
            ch."CHEQ_IMPORTE"        AS cheq_importe,
            ch."CHEQ_IMPORTE_LOC"    AS cheq_importe_loc,
            ch."CHEQ_SITUACION"      AS cheq_situacion,
            ch."CHEQ_OBS"            AS cheq_obs,
            ch."CHEQ_NRO_CTA_CHEQ"  AS cheq_nro_cta_cheq,
            ch."CHEQ_FEC_GRAB"       AS cheq_fec_grab,
            ch."CHEQ_LOGIN"          AS cheq_login
     FROM fin_cheque ch
     LEFT JOIN fin_banco  b ON b."BCO_CODIGO" = ch."CHEQ_BCO"
     LEFT JOIN gen_moneda m ON m."MON_CODIGO" = ch."CHEQ_MON"
     WHERE ch."CHEQ_CLAVE" = $1`,
    [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Cheque no encontrado' };
  return rows[0];
};

module.exports = { getAll, getById };
