const pool = require('../../../config/db');

// ─── ÓRDENES DE PAGO ─────────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (o."ORDP_BENEFICIARIO" ILIKE $1 OR CAST(o."ORDP_CODIGO" AS TEXT) ILIKE $1 OR p."PROV_RAZON_SOCIAL" ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM fin_orden_pago o
     LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = o."ORDP_PROV"
     ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    codigo:  'o."ORDP_CODIGO"',
    fecha:   'o."ORDP_FEC_ORDEN"',
    benef:   'o."ORDP_BENEFICIARIO"',
    prov:    'p."PROV_RAZON_SOCIAL"',
    total:   'o."ORDP_TOT_PAGO"',
    estado:  'o."ORDP_ESTADO"',
  };
  const dir     = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'o."ORDP_CLAVE" DESC';
  const select  = `
    SELECT o."ORDP_CLAVE" AS ordp_clave, o."ORDP_CODIGO" AS ordp_codigo,
           o."ORDP_FEC_ORDEN" AS ordp_fec_orden, o."ORDP_BENEFICIARIO" AS ordp_beneficiario,
           o."ORDP_PROV" AS ordp_prov, p."PROV_RAZON_SOCIAL" AS prov_nom,
           o."ORDP_CTA_BCO" AS ordp_cta_bco, c."CTA_DESC" AS cta_desc,
           o."ORDP_MON" AS ordp_mon, m."MON_DESC" AS mon_desc,
           o."ORDP_TOT_PAGO" AS ordp_tot_pago, o."ORDP_ESTADO" AS ordp_estado,
           o."ORDP_OBS" AS ordp_obs
    FROM fin_orden_pago o
    LEFT JOIN fin_proveedor      p ON p."PROV_CODIGO"  = o."ORDP_PROV"
    LEFT JOIN fin_cuenta_bancaria c ON c."CTA_CODIGO"  = o."ORDP_CTA_BCO" AND c."CTA_EMPR" = 1
    LEFT JOIN gen_moneda          m ON m."MON_CODIGO"  = o."ORDP_MON"
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
    `SELECT o."ORDP_CLAVE" AS ordp_clave, o."ORDP_CODIGO" AS ordp_codigo,
            o."ORDP_EMPR" AS ordp_empr, o."ORDP_SUC" AS ordp_suc,
            o."ORDP_FEC_ORDEN" AS ordp_fec_orden, o."ORDP_BENEFICIARIO" AS ordp_beneficiario,
            o."ORDP_PROV" AS ordp_prov, p."PROV_RAZON_SOCIAL" AS prov_nom,
            o."ORDP_CTA_BCO" AS ordp_cta_bco, c."CTA_DESC" AS cta_desc,
            o."ORDP_NRO_CTA_BANC" AS ordp_nro_cta_banc,
            o."ORDP_FCON_CODIGO" AS ordp_fcon_codigo, f."FPAG_DESC" AS fcon_desc,
            o."ORDP_MON" AS ordp_mon, m."MON_DESC" AS mon_desc,
            o."ORDP_CHEQ_NRO" AS ordp_cheq_nro, o."ORDP_CHEQ_FEC" AS ordp_cheq_fec,
            o."ORDP_CHEQ_IMPORTE" AS ordp_cheq_importe,
            o."ORDP_TOT_PAGO" AS ordp_tot_pago, o."ORDP_PORC_DCTO" AS ordp_porc_dcto,
            o."ORDP_TOT_DCTO" AS ordp_tot_dcto,
            o."ORDP_ESTADO" AS ordp_estado, o."ORDP_OBS" AS ordp_obs
     FROM fin_orden_pago o
     LEFT JOIN fin_proveedor      p ON p."PROV_CODIGO" = o."ORDP_PROV"
     LEFT JOIN fin_cuenta_bancaria c ON c."CTA_CODIGO" = o."ORDP_CTA_BCO" AND c."CTA_EMPR" = 1
     LEFT JOIN fin_forma_pago      f ON f."FPAG_CODIGO" = o."ORDP_FCON_CODIGO"
     LEFT JOIN gen_moneda           m ON m."MON_CODIGO" = o."ORDP_MON"
     WHERE o."ORDP_CLAVE" = $1`,
    [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Orden de pago no encontrada' };
  return rows[0];
};

const create = async (data) => {
  const { rows: claveRows } = await pool.query('SELECT COALESCE(MAX("ORDP_CLAVE"), 0) + 1 AS next FROM fin_orden_pago');
  const clave = claveRows[0].next;
  const { rows: codigoRows } = await pool.query(
    `SELECT COALESCE(MAX("ORDP_CODIGO"), 0) + 1 AS next FROM fin_orden_pago WHERE "ORDP_EMPR" = 1 AND "ORDP_SUC" = 1`
  );
  const codigo = codigoRows[0].next;

  await pool.query(
    `INSERT INTO fin_orden_pago
     ("ORDP_CLAVE","ORDP_EMPR","ORDP_SUC","ORDP_CODIGO",
      "ORDP_FEC_ORDEN","ORDP_BENEFICIARIO","ORDP_PROV",
      "ORDP_CTA_BCO","ORDP_NRO_CTA_BANC","ORDP_FCON_CODIGO",
      "ORDP_MON","ORDP_CHEQ_NRO","ORDP_CHEQ_FEC","ORDP_CHEQ_IMPORTE",
      "ORDP_TOT_PAGO","ORDP_PORC_DCTO","ORDP_TOT_DCTO",
      "ORDP_ESTADO","ORDP_OBS")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
    [
      clave, 1, 1, codigo,
      data.ordp_fec_orden,
      data.ordp_beneficiario || null,
      data.ordp_prov         || null,
      data.ordp_cta_bco      || null,
      data.ordp_nro_cta_banc || null,
      data.ordp_fcon_codigo  || null,
      data.ordp_mon          || null,
      data.ordp_cheq_nro     || null,
      data.ordp_cheq_fec     || null,
      data.ordp_cheq_importe || null,
      data.ordp_tot_pago     || null,
      data.ordp_porc_dcto    || 0,
      data.ordp_tot_dcto     || 0,
      data.ordp_estado       || 'P',
      data.ordp_obs          || null,
    ]
  );
  return getById(clave);
};

const update = async (clave, data) => {
  const fields = []; const params = [];
  const map = {
    ordp_fec_orden:    '"ORDP_FEC_ORDEN"',
    ordp_beneficiario: '"ORDP_BENEFICIARIO"',
    ordp_prov:         '"ORDP_PROV"',
    ordp_cta_bco:      '"ORDP_CTA_BCO"',
    ordp_nro_cta_banc: '"ORDP_NRO_CTA_BANC"',
    ordp_fcon_codigo:  '"ORDP_FCON_CODIGO"',
    ordp_mon:          '"ORDP_MON"',
    ordp_cheq_nro:     '"ORDP_CHEQ_NRO"',
    ordp_cheq_fec:     '"ORDP_CHEQ_FEC"',
    ordp_cheq_importe: '"ORDP_CHEQ_IMPORTE"',
    ordp_tot_pago:     '"ORDP_TOT_PAGO"',
    ordp_porc_dcto:    '"ORDP_PORC_DCTO"',
    ordp_tot_dcto:     '"ORDP_TOT_DCTO"',
    ordp_estado:       '"ORDP_ESTADO"',
    ordp_obs:          '"ORDP_OBS"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (fields.length) {
    params.push(clave);
    await pool.query(
      `UPDATE fin_orden_pago SET ${fields.join(', ')} WHERE "ORDP_CLAVE" = $${params.length}`,
      params
    );
  }
  return getById(clave);
};

const remove = async (clave) => {
  await pool.query('DELETE FROM fin_orden_pago WHERE "ORDP_CLAVE" = $1', [clave]);
};

module.exports = { getAll, getById, create, update, remove };
