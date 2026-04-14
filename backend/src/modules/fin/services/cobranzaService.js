const pool = require('../../../config/db');

// ─── FACTURAS PENDIENTES DE COBRO ───────────────────────────────────────────

const getPendientes = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  let filters = 'WHERE d."DOC_TIPO_MOV" IN (9, 10) AND d."DOC_SALDO_LOC" > 0';
  if (search) {
    params.push(`%${search}%`);
    filters += ` AND (COALESCE(c."CLI_NOM", d."DOC_CLI_NOM") ILIKE $${params.length} OR CAST(d."DOC_NRO_DOC" AS TEXT) ILIKE $${params.length})`;
  }

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM fin_documento d LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = d."DOC_CLI" ${filters}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);

  const allowedSort = {
    nro: 'd."DOC_NRO_DOC"', fecha: 'd."DOC_FEC_DOC"',
    cliente: 'COALESCE(c."CLI_NOM", d."DOC_CLI_NOM")',
    total: 'd."DOC_SALDO_LOC"', saldo: 'd."DOC_SALDO_LOC"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'd."DOC_FEC_DOC" ASC';

  const select = `
    SELECT d."DOC_CLAVE" AS doc_clave, d."DOC_NRO_DOC" AS doc_nro_doc,
           d."DOC_FEC_DOC" AS doc_fec_doc, d."DOC_TIPO_MOV" AS doc_tipo_mov,
           d."DOC_CLI" AS doc_cli,
           COALESCE(c."CLI_NOM", d."DOC_CLI_NOM") AS cli_nom,
           d."DOC_CLI_RUC" AS doc_cli_ruc,
           d."DOC_MON" AS doc_mon, m."MON_DESC" AS mon_desc,
           d."DOC_SALDO_LOC" AS doc_saldo_loc,
           d."DOC_SALDO_MON" AS doc_saldo_mon,
           d."DOC_NETO_GRAV_LOC" + d."DOC_NETO_EXEN_LOC" + d."DOC_IVA_LOC" AS doc_total_loc
    FROM fin_documento d
    LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = d."DOC_CLI"
    LEFT JOIN gen_moneda m ON m."MON_CODIGO" = d."DOC_MON"
    ${filters} ORDER BY ${orderBy}`;

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

// ─── CUOTAS DE UNA FACTURA ──────────────────────────────────────────────────

const getCuotas = async (docClave) => {
  const { rows } = await pool.query(
    `SELECT c."CUO_CLAVE_DOC" AS cuo_clave_doc, c."CUO_FEC_VTO" AS cuo_fec_vto,
            c."CUO_IMP_LOC" AS cuo_imp_loc, c."CUO_IMP_MON" AS cuo_imp_mon,
            c."CUO_SALDO_LOC" AS cuo_saldo_loc, c."CUO_SALDO_MON" AS cuo_saldo_mon
     FROM fin_cuota c
     WHERE c."CUO_CLAVE_DOC" = $1
     ORDER BY c."CUO_FEC_VTO"`,
    [docClave]
  );
  return rows;
};

// ─── HISTORIAL DE COBROS ────────────────────────────────────────────────────

const getCobros = async ({ page = 1, limit = 20, search = '', sortField = '', sortDir = 'desc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  let filters = '';
  if (search) {
    params.push(`%${search}%`);
    filters = `WHERE (COALESCE(c."CLI_NOM", d."DOC_CLI_NOM") ILIKE $${params.length} OR CAST(d."DOC_NRO_DOC" AS TEXT) ILIKE $${params.length})`;
  }

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM fin_pago p
     JOIN fin_documento d ON d."DOC_CLAVE" = p."PAG_CLAVE_DOC"
     LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = d."DOC_CLI"
     ${filters}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);

  const allowedSort = {
    fecha: 'p."PAG_FEC_PAGO"', cliente: 'COALESCE(c."CLI_NOM", d."DOC_CLI_NOM")',
    importe: 'p."PAG_IMP_LOC"', nro: 'd."DOC_NRO_DOC"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'p."PAG_FEC_PAGO" DESC';

  const select = `
    SELECT p."PAG_CLAVE_DOC" AS pag_clave_doc, p."PAG_FEC_VTO" AS pag_fec_vto,
           p."PAG_CLAVE_PAGO" AS pag_clave_pago, p."PAG_FEC_PAGO" AS pag_fec_pago,
           p."PAG_IMP_LOC" AS pag_imp_loc, p."PAG_IMP_MON" AS pag_imp_mon,
           p."PAG_LOGIN" AS pag_login,
           d."DOC_NRO_DOC" AS doc_nro_doc, d."DOC_FEC_DOC" AS doc_fec_doc,
           COALESCE(c."CLI_NOM", d."DOC_CLI_NOM") AS cli_nom,
           d."DOC_CLI" AS doc_cli
    FROM fin_pago p
    JOIN fin_documento d ON d."DOC_CLAVE" = p."PAG_CLAVE_DOC"
    LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = d."DOC_CLI"
    ${filters} ORDER BY ${orderBy}`;

  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

// ─── REGISTRAR COBRO ────────────────────────────────────────────────────────

const registrarCobro = async (data, login = 'SISTEMA') => {
  const { doc_clave, importe, fec_pago, fec_vto } = data;
  if (!doc_clave || !importe || importe <= 0) throw { status: 400, message: 'Datos incompletos' };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar factura y saldo
    const { rows: [fac] } = await client.query(
      `SELECT "DOC_CLAVE", "DOC_SALDO_LOC", "DOC_SALDO_MON", "DOC_MON"
       FROM fin_documento WHERE "DOC_CLAVE" = $1 AND "DOC_TIPO_MOV" IN (9, 10)`,
      [doc_clave]
    );
    if (!fac) throw { status: 404, message: 'Factura no encontrada' };

    const saldo = parseFloat(fac.DOC_SALDO_LOC) || 0;
    const impNum = parseFloat(importe);
    if (impNum > saldo + 0.01) throw { status: 400, message: `El importe (${impNum}) supera el saldo pendiente (${saldo})` };

    const hoy = new Date().toISOString().split('T')[0];
    const fechaPago = fec_pago || hoy;
    const fechaVto  = fec_vto || fechaPago;

    // Insertar pago en fin_pago
    await client.query(
      `INSERT INTO fin_pago
       ("PAG_CLAVE_DOC","PAG_FEC_VTO","PAG_CLAVE_PAGO","PAG_FEC_PAGO",
        "PAG_IMP_LOC","PAG_IMP_MON","PAG_LOGIN","PAG_FEC_GRAB","PAG_SIST",
        "PAG_IMP_INT_LOC","PAG_IMP_INT_MON",
        "PAG_EXEN_PAGO_MON","PAG_EXEN_PAGO_LOC",
        "PAG_GRAV_PAGO_MON","PAG_GRAV_PAGO_LOC",
        "PAG_IVA_PAGO_MON","PAG_IVA_PAGO_LOC",
        "PAG_PCT_RETENCION","PAG_RETENCION_MON","PAG_RETENCION_LOC",
        "PAG_INTERES_MON","PAG_INTERES_LOC")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
      [
        doc_clave, fechaVto, doc_clave, fechaPago,
        impNum, impNum, login, hoy, 'FAC',
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]
    );

    // Actualizar saldo de la factura
    const nuevoSaldo = Math.max(0, saldo - impNum);
    await client.query(
      `UPDATE fin_documento SET "DOC_SALDO_LOC" = $1, "DOC_SALDO_MON" = $1
       WHERE "DOC_CLAVE" = $2`,
      [nuevoSaldo, doc_clave]
    );

    // Si hay cuota con saldo, descontar de la primera pendiente
    const { rows: cuotas } = await client.query(
      `SELECT "CUO_CLAVE_DOC", "CUO_FEC_VTO", "CUO_SALDO_LOC"
       FROM fin_cuota WHERE "CUO_CLAVE_DOC" = $1 AND "CUO_SALDO_LOC" > 0
       ORDER BY "CUO_FEC_VTO"`,
      [doc_clave]
    );
    let restante = impNum;
    for (const cuo of cuotas) {
      if (restante <= 0) break;
      const cuoSaldo = parseFloat(cuo.CUO_SALDO_LOC) || 0;
      const descuento = Math.min(restante, cuoSaldo);
      await client.query(
        `UPDATE fin_cuota SET "CUO_SALDO_LOC" = "CUO_SALDO_LOC" - $1, "CUO_SALDO_MON" = "CUO_SALDO_MON" - $1
         WHERE "CUO_CLAVE_DOC" = $2 AND "CUO_FEC_VTO" = $3`,
        [descuento, doc_clave, cuo.CUO_FEC_VTO]
      );
      restante -= descuento;
    }

    await client.query('COMMIT');
    return { doc_clave, importe: impNum, saldo_anterior: saldo, saldo_nuevo: nuevoSaldo };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { getPendientes, getCuotas, getCobros, registrarCobro };
