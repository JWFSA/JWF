const pool = require('../../../config/db');

const BASE_SELECT = `
  SELECT
    d."DOC_CLAVE" AS doc_clave,
    d."DOC_NRO_DOC" AS doc_nro_doc,
    d."DOC_NRO_TIMBRADO" AS doc_nro_timbrado,
    d."DOC_SERIE" AS doc_serie,
    d."DOC_FEC_DOC" AS doc_fec_doc,
    d."DOC_CLI" AS doc_cli,
    COALESCE(c."CLI_NOM", d."DOC_CLI_NOM") AS cli_nom,
    d."DOC_CLI_NOM" AS doc_cli_nom,
    d."DOC_CLI_RUC" AS doc_cli_ruc,
    d."DOC_COND_VTA" AS doc_cond_vta,
    d."DOC_MON" AS doc_mon,
    m."MON_DESC" AS mon_desc, m."MON_SIMBOLO" AS mon_simbolo,
    d."DOC_OBS" AS doc_obs,
    d."DOC_GRAV_10_LOC" AS doc_grav_10_loc,
    d."DOC_GRAV_5_LOC" AS doc_grav_5_loc,
    d."DOC_NETO_EXEN_LOC" AS doc_neto_exen_loc,
    d."DOC_IVA_10_LOC" AS doc_iva_10_loc,
    d."DOC_IVA_5_LOC" AS doc_iva_5_loc,
    d."DOC_SALDO_LOC" AS doc_saldo_loc
  FROM fin_documento d
  LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = d."DOC_CLI"
  LEFT JOIN gen_moneda m ON m."MON_CODIGO" = d."DOC_MON"
  WHERE d."DOC_TIPO_MOV" = 10
`;

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc',
  fechaDesde = '', fechaHasta = '', moneda = '', soloConSaldo = false } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = [];
  let filters = '';
  if (search) { params.push(`%${search}%`); filters += ` AND (COALESCE(c."CLI_NOM", d."DOC_CLI_NOM") ILIKE $${params.length} OR CAST(d."DOC_NRO_DOC" AS TEXT) ILIKE $${params.length} OR d."DOC_NRO_TIMBRADO" ILIKE $${params.length})`; }
  if (fechaDesde) { params.push(fechaDesde); filters += ` AND d."DOC_FEC_DOC" >= $${params.length}`; }
  if (fechaHasta) { params.push(fechaHasta); filters += ` AND d."DOC_FEC_DOC" <= $${params.length}`; }
  if (moneda) { params.push(Number(moneda)); filters += ` AND d."DOC_MON" = $${params.length}`; }
  if (soloConSaldo) { filters += ` AND d."DOC_SALDO_LOC" > 0`; }

  const summaryRes = await pool.query(
    `SELECT COUNT(*) AS count,
            COALESCE(SUM(d."DOC_GRAV_10_LOC"), 0)    AS sum_grav_10,
            COALESCE(SUM(d."DOC_GRAV_5_LOC"), 0)     AS sum_grav_5,
            COALESCE(SUM(d."DOC_NETO_EXEN_LOC"), 0)  AS sum_exenta,
            COALESCE(SUM(d."DOC_IVA_10_LOC"), 0)     AS sum_iva_10,
            COALESCE(SUM(d."DOC_IVA_5_LOC"), 0)      AS sum_iva_5,
            COALESCE(SUM(d."DOC_SALDO_LOC"), 0)       AS sum_saldo
     FROM fin_documento d
     LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = d."DOC_CLI"
     WHERE d."DOC_TIPO_MOV" = 10 ${filters}`,
    params
  );
  const { count, sum_grav_10, sum_grav_5, sum_exenta, sum_iva_10, sum_iva_5, sum_saldo } = summaryRes.rows[0];
  const total = parseInt(count);
  const summary = {
    totalGrav10: Number(sum_grav_10), totalGrav5: Number(sum_grav_5),
    totalExenta: Number(sum_exenta), totalIva10: Number(sum_iva_10),
    totalIva5: Number(sum_iva_5), totalSaldo: Number(sum_saldo),
  };

  const allowedSort = {
    clave: 'd."DOC_CLAVE"', nro: 'd."DOC_NRO_DOC"', fecha: 'd."DOC_FEC_DOC"',
    cliente: 'COALESCE(c."CLI_NOM", d."DOC_CLI_NOM")', total: 'd."DOC_SALDO_LOC"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'd."DOC_CLAVE" DESC';
  const select = `${BASE_SELECT} ${filters} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 }, summary };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }, summary };
};

const getById = async (clave) => {
  const { rows } = await pool.query(`${BASE_SELECT} AND d."DOC_CLAVE" = $1`, [clave]);
  if (!rows.length) throw { status: 404, message: 'Factura no encontrada' };
  const factura = rows[0];
  const { rows: items } = await pool.query(
    `SELECT
       dd."DET_CLAVE_DOC" AS det_clave_doc,
       dd."DET_NRO_ITEM" AS det_nro_item,
       dd."DET_ART" AS det_art,
       dd."DET_ART_DESC" AS det_art_desc,
       dd."DET_CANT" AS det_cant,
       dd."DET_UM_FAC" AS det_um_fac,
       dd."DET_PRECIO_MON" AS det_precio_mon,
       dd."DET_PORC_DTO" AS det_porc_dto,
       dd."DET_NETO_LOC" AS det_neto_loc,
       dd."DET_COD_IVA" AS det_cod_iva,
       dd."DET_IVA_LOC" AS det_iva_loc
     FROM fac_documento_det dd
     WHERE dd."DET_CLAVE_DOC" = $1
     ORDER BY dd."DET_NRO_ITEM"`,
    [clave]
  );
  return { ...factura, items };
};

const create = async (data) => {
  const { rows: [{ next: clave }] } = await pool.query(
    'SELECT COALESCE(MAX("DOC_CLAVE"), 1493000000) + 1 AS next FROM fin_documento'
  );
  const { rows: [{ next: nro_doc }] } = await pool.query(
    'SELECT COALESCE(MAX("DOC_NRO_DOC") FILTER (WHERE "DOC_TIPO_MOV" = 10), 10010000000) + 1 AS next FROM fin_documento'
  );

  const {
    doc_fec_doc, doc_cli, doc_cli_nom, doc_cli_ruc,
    doc_nro_timbrado, doc_serie, doc_cond_vta, doc_mon = 1, doc_obs,
    doc_grav_10_loc = 0, doc_grav_5_loc = 0, doc_neto_exen_loc = 0,
    doc_iva_10_loc = 0, doc_iva_5_loc = 0, doc_saldo_loc = 0,
    items = [],
  } = data;

  await pool.query(
    `INSERT INTO fin_documento (
      "DOC_CLAVE","DOC_TIPO_MOV","DOC_NRO_DOC","DOC_FEC_DOC","DOC_FEC_OPER",
      "DOC_CLI","DOC_CLI_NOM","DOC_CLI_RUC","DOC_NRO_TIMBRADO","DOC_SERIE",
      "DOC_COND_VTA","DOC_MON","DOC_OBS",
      "DOC_GRAV_10_LOC","DOC_GRAV_5_LOC","DOC_NETO_EXEN_LOC",
      "DOC_IVA_10_LOC","DOC_IVA_5_LOC","DOC_SALDO_LOC",
      "DOC_NETO_GRAV_LOC","DOC_IVA_LOC","DOC_SIST"
    ) VALUES ($1,10,$2,$3,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'FAC')`,
    [
      clave, nro_doc, doc_fec_doc,
      doc_cli || null, doc_cli_nom || null, doc_cli_ruc || null,
      doc_nro_timbrado || null, doc_serie || null,
      doc_cond_vta || null, doc_mon, doc_obs || null,
      doc_grav_10_loc, doc_grav_5_loc, doc_neto_exen_loc,
      doc_iva_10_loc, doc_iva_5_loc, doc_saldo_loc,
      Number(doc_grav_10_loc) + Number(doc_grav_5_loc),
      Number(doc_iva_10_loc) + Number(doc_iva_5_loc),
    ]
  );

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    await pool.query(
      `INSERT INTO fac_documento_det (
        "DET_CLAVE_DOC","DET_NRO_ITEM","DET_ART","DET_ART_DESC",
        "DET_CANT","DET_UM_FAC","DET_PRECIO_MON","DET_PORC_DTO",
        "DET_NETO_LOC","DET_NETO_MON","DET_COD_IVA","DET_IVA_LOC","DET_IVA_MON",
        "DET_NETO_GRAV_LOC","DET_NETO_GRAV_MON","DET_NETO_EXEN_LOC","DET_NETO_EXEN_MON"
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10,$11,$11,$12,$12,$13,$13)`,
      [
        clave, i + 1, it.det_art || null, it.det_art_desc || null,
        it.det_cant, it.det_um_fac || null, it.det_precio_mon,
        it.det_porc_dto || 0,
        it.det_neto_loc, it.det_cod_iva,
        it.det_iva_loc,
        it.det_cod_iva === 1 ? 0 : it.det_neto_loc,
        it.det_cod_iva === 1 ? it.det_neto_loc : 0,
      ]
    );
  }

  return getById(clave);
};

const update = async (clave, data) => {
  const {
    doc_fec_doc, doc_cli, doc_cli_nom, doc_cli_ruc,
    doc_nro_timbrado, doc_serie, doc_cond_vta, doc_mon = 1, doc_obs,
    doc_grav_10_loc = 0, doc_grav_5_loc = 0, doc_neto_exen_loc = 0,
    doc_iva_10_loc = 0, doc_iva_5_loc = 0, doc_saldo_loc = 0,
    items = [],
  } = data;

  await pool.query(
    `UPDATE fin_documento SET
      "DOC_FEC_DOC" = $1, "DOC_FEC_OPER" = $1,
      "DOC_CLI" = $2, "DOC_CLI_NOM" = $3, "DOC_CLI_RUC" = $4,
      "DOC_NRO_TIMBRADO" = $5, "DOC_SERIE" = $6,
      "DOC_COND_VTA" = $7, "DOC_MON" = $8, "DOC_OBS" = $9,
      "DOC_GRAV_10_LOC" = $10, "DOC_GRAV_5_LOC" = $11, "DOC_NETO_EXEN_LOC" = $12,
      "DOC_IVA_10_LOC" = $13, "DOC_IVA_5_LOC" = $14, "DOC_SALDO_LOC" = $15,
      "DOC_NETO_GRAV_LOC" = $16, "DOC_IVA_LOC" = $17
    WHERE "DOC_CLAVE" = $18 AND "DOC_TIPO_MOV" = 10`,
    [
      doc_fec_doc,
      doc_cli || null, doc_cli_nom || null, doc_cli_ruc || null,
      doc_nro_timbrado || null, doc_serie || null,
      doc_cond_vta || null, doc_mon, doc_obs || null,
      doc_grav_10_loc, doc_grav_5_loc, doc_neto_exen_loc,
      doc_iva_10_loc, doc_iva_5_loc, doc_saldo_loc,
      Number(doc_grav_10_loc) + Number(doc_grav_5_loc),
      Number(doc_iva_10_loc) + Number(doc_iva_5_loc),
      clave,
    ]
  );

  await pool.query('DELETE FROM fac_documento_det WHERE "DET_CLAVE_DOC" = $1', [clave]);

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    await pool.query(
      `INSERT INTO fac_documento_det (
        "DET_CLAVE_DOC","DET_NRO_ITEM","DET_ART","DET_ART_DESC",
        "DET_CANT","DET_UM_FAC","DET_PRECIO_MON","DET_PORC_DTO",
        "DET_NETO_LOC","DET_NETO_MON","DET_COD_IVA","DET_IVA_LOC","DET_IVA_MON",
        "DET_NETO_GRAV_LOC","DET_NETO_GRAV_MON","DET_NETO_EXEN_LOC","DET_NETO_EXEN_MON"
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10,$11,$11,$12,$12,$13,$13)`,
      [
        clave, i + 1, it.det_art || null, it.det_art_desc || null,
        it.det_cant, it.det_um_fac || null, it.det_precio_mon,
        it.det_porc_dto || 0,
        it.det_neto_loc, it.det_cod_iva,
        it.det_iva_loc,
        it.det_cod_iva === 1 ? 0 : it.det_neto_loc,
        it.det_cod_iva === 1 ? it.det_neto_loc : 0,
      ]
    );
  }

  return getById(clave);
};

const remove = async (clave) => {
  await pool.query('DELETE FROM fac_documento_det WHERE "DET_CLAVE_DOC" = $1', [clave]);
  await pool.query('DELETE FROM fin_documento WHERE "DOC_CLAVE" = $1 AND "DOC_TIPO_MOV" = 10', [clave]);
};

module.exports = { getAll, getById, create, update, remove };
