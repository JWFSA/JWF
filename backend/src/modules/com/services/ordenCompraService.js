const pool = require('../../../config/db');

// ─── ÓRDENES DE COMPRA ──────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc',
  fechaDesde = '', fechaHasta = '', estado = '' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = [];
  let filters = 'WHERE 1=1';
  if (search) { params.push(`%${search}%`); filters += ` AND (CAST(o."ORCOM_NRO" AS TEXT) ILIKE $${params.length} OR p."PROV_RAZON_SOCIAL" ILIKE $${params.length} OR o."ORCOM_OBS" ILIKE $${params.length} OR o."ORCOM_CLIENTE" ILIKE $${params.length})`; }
  if (fechaDesde) { params.push(fechaDesde); filters += ` AND o."ORCOM_FEC_EMIS" >= $${params.length}`; }
  if (fechaHasta) { params.push(fechaHasta); filters += ` AND o."ORCOM_FEC_EMIS" <= $${params.length}`; }
  if (estado) { params.push(estado); filters += ` AND o."ORCOM_ESTADO" = $${params.length}`; }

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM com_orden_compra o
     LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = o."ORCOM_PROV"
     ${filters}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nro:     'o."ORCOM_NRO"',
    fecha:   'o."ORCOM_FEC_EMIS"',
    prov:    'p."PROV_RAZON_SOCIAL"',
    total:   'o."ORCOM_TOTAL"',
    estado:  'o."ORCOM_ESTADO"',
  };
  const dir     = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'o."ORCOM_NRO" DESC';
  const select  = `
    SELECT o."ORCOM_NRO"           AS orcom_nro,
           o."ORCOM_FEC_EMIS"      AS orcom_fec_emis,
           o."ORCOM_PROV"          AS orcom_prov,
           p."PROV_RAZON_SOCIAL"   AS prov_nom,
           o."ORCOM_DPTO_SOLICITA" AS orcom_dpto_solicita,
           o."ORCOM_RESPONSABLE"   AS orcom_responsable,
           o."ORCOM_CLIENTE"       AS orcom_cliente,
           o."ORCOM_MON"           AS orcom_mon,
           m."MON_DESC"            AS mon_desc,
           o."ORCOM_TASA"          AS orcom_tasa,
           o."ORCOM_TOTAL"         AS orcom_total,
           o."ORCOM_ESTADO"        AS orcom_estado,
           o."ORCOM_OBS"           AS orcom_obs,
           o."ORCOM_FORMA_PAGO"    AS orcom_forma_pago,
           o."ORCOM_FEC_VTO"       AS orcom_fec_vto,
           o."ORCOM_PROCESADO"     AS orcom_procesado
    FROM com_orden_compra o
    LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = o."ORCOM_PROV"
    LEFT JOIN gen_moneda    m ON m."MON_CODIGO"  = o."ORCOM_MON"
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

const getById = async (nro) => {
  const { rows } = await pool.query(
    `SELECT o."ORCOM_NRO"           AS orcom_nro,
            o."ORCOM_FEC_EMIS"      AS orcom_fec_emis,
            o."ORCOM_PROV"          AS orcom_prov,
            p."PROV_RAZON_SOCIAL"   AS prov_nom,
            o."ORCOM_DPTO_SOLICITA" AS orcom_dpto_solicita,
            o."ORCOM_RESPONSABLE"   AS orcom_responsable,
            o."ORCOM_CLIENTE"       AS orcom_cliente,
            o."ORCOM_MON"           AS orcom_mon,
            m."MON_DESC"            AS mon_desc,
            o."ORCOM_TASA"          AS orcom_tasa,
            o."ORCOM_TOTAL"         AS orcom_total,
            o."ORCOM_ESTADO"        AS orcom_estado,
            o."ORCOM_LOGIN_ESTADO"  AS orcom_login_estado,
            o."ORCOM_FEC_ESTADO"    AS orcom_fec_estado,
            o."ORCOM_OBS"           AS orcom_obs,
            o."ORCOM_LOGIN"         AS orcom_login,
            o."ORCOM_FEC_GRAB"      AS orcom_fec_grab,
            o."ORCOM_FORMA_PAGO"    AS orcom_forma_pago,
            o."ORCOM_FEC_VTO"       AS orcom_fec_vto,
            o."ORCOM_PROCESADO"     AS orcom_procesado
     FROM com_orden_compra o
     LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = o."ORCOM_PROV"
     LEFT JOIN gen_moneda    m ON m."MON_CODIGO"  = o."ORCOM_MON"
     WHERE o."ORCOM_NRO" = $1`,
    [nro]
  );
  if (!rows.length) throw { status: 404, message: 'Orden de compra no encontrada' };

  const { rows: detalle } = await pool.query(
    `SELECT d."ORCOMDET_NRO"          AS orcomdet_nro,
            d."ORCOMDET_ITEM"         AS orcomdet_item,
            d."ORCOMDET_TIPO_MOV"     AS orcomdet_tipo_mov,
            d."ORCOMDET_ART"          AS orcomdet_art,
            d."ORCOMDET_ART_DESC"     AS orcomdet_art_desc,
            d."ORCOMDET_ART_UNID_MED" AS orcomdet_art_unid_med,
            d."ORCOMDET_CANT"         AS orcomdet_cant,
            d."ORCOMDET_PRECIO_UNIT"  AS orcomdet_precio_unit,
            d."ORCOMDET_IMPU_CODIGO"  AS orcomdet_impu_codigo,
            d."ORCOMDET_EXENTA"       AS orcomdet_exenta,
            d."ORCOMDET_GRAVADA"      AS orcomdet_gravada,
            d."ORCOMDET_IMPUESTO"     AS orcomdet_impuesto,
            d."ORCOMDET_TOTAL"        AS orcomdet_total,
            d."ORCOMDET_DESC_LARGA"   AS orcomdet_desc_larga
     FROM com_orden_compra_det d
     WHERE d."ORCOMDET_NRO" = $1
     ORDER BY d."ORCOMDET_ITEM"`,
    [nro]
  );

  return { ...rows[0], detalle };
};

const insertItems = async (client, nro, items) => {
  for (let i = 0; i < items.length; i++) {
    const d = items[i];
    await client.query(
      `INSERT INTO com_orden_compra_det
       ("ORCOMDET_NRO","ORCOMDET_ITEM","ORCOMDET_TIPO_MOV","ORCOMDET_ART",
        "ORCOMDET_ART_DESC","ORCOMDET_ART_UNID_MED","ORCOMDET_CANT",
        "ORCOMDET_PRECIO_UNIT","ORCOMDET_IMPU_CODIGO","ORCOMDET_EXENTA",
        "ORCOMDET_GRAVADA","ORCOMDET_IMPUESTO","ORCOMDET_TOTAL","ORCOMDET_DESC_LARGA")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        nro, i + 1,
        d.orcomdet_tipo_mov     || null,
        d.orcomdet_art          || null,
        d.orcomdet_art_desc     || null,
        d.orcomdet_art_unid_med || null,
        d.orcomdet_cant         || 0,
        d.orcomdet_precio_unit  || 0,
        d.orcomdet_impu_codigo  || null,
        d.orcomdet_exenta       || 0,
        d.orcomdet_gravada      || 0,
        d.orcomdet_impuesto     || 0,
        d.orcomdet_total        || 0,
        d.orcomdet_desc_larga   || null,
      ]
    );
  }
};

const create = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: nroRows } = await client.query('SELECT COALESCE(MAX("ORCOM_NRO"), 0) + 1 AS next FROM com_orden_compra');
    const nro = nroRows[0].next;
    const now = new Date().toISOString().split('T')[0];

    await client.query(
      `INSERT INTO com_orden_compra
       ("ORCOM_NRO","ORCOM_FEC_EMIS","ORCOM_PROV","ORCOM_DPTO_SOLICITA",
        "ORCOM_RESPONSABLE","ORCOM_CLIENTE","ORCOM_MON","ORCOM_TASA",
        "ORCOM_TOTAL","ORCOM_ESTADO","ORCOM_LOGIN_ESTADO","ORCOM_FEC_ESTADO",
        "ORCOM_OBS","ORCOM_LOGIN","ORCOM_FEC_GRAB","ORCOM_FORMA_PAGO",
        "ORCOM_FEC_VTO","ORCOM_PROCESADO")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        nro,
        data.orcom_fec_emis,
        data.orcom_prov          || null,
        data.orcom_dpto_solicita || null,
        data.orcom_responsable   || null,
        data.orcom_cliente       || null,
        data.orcom_mon           || null,
        data.orcom_tasa          || null,
        data.orcom_total         || 0,
        data.orcom_estado        || 'PE',
        data.orcom_login         || null,
        now,
        data.orcom_obs           || null,
        data.orcom_login         || null,
        now,
        data.orcom_forma_pago    || null,
        data.orcom_fec_vto       || null,
        data.orcom_procesado     || null,
      ]
    );

    if (data.detalle && Array.isArray(data.detalle)) {
      await insertItems(client, nro, data.detalle);
    }

    await client.query('COMMIT');
    return getById(nro);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const update = async (nro, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const fields = []; const params = [];
    const map = {
      orcom_fec_emis:      '"ORCOM_FEC_EMIS"',
      orcom_prov:          '"ORCOM_PROV"',
      orcom_dpto_solicita: '"ORCOM_DPTO_SOLICITA"',
      orcom_responsable:   '"ORCOM_RESPONSABLE"',
      orcom_cliente:       '"ORCOM_CLIENTE"',
      orcom_mon:           '"ORCOM_MON"',
      orcom_tasa:          '"ORCOM_TASA"',
      orcom_total:         '"ORCOM_TOTAL"',
      orcom_estado:        '"ORCOM_ESTADO"',
      orcom_obs:           '"ORCOM_OBS"',
      orcom_forma_pago:    '"ORCOM_FORMA_PAGO"',
      orcom_fec_vto:       '"ORCOM_FEC_VTO"',
      orcom_procesado:     '"ORCOM_PROCESADO"',
    };
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
    }
    if (fields.length) {
      params.push(nro);
      await client.query(
        `UPDATE com_orden_compra SET ${fields.join(', ')} WHERE "ORCOM_NRO" = $${params.length}`,
        params
      );
    }

    if (data.detalle && Array.isArray(data.detalle)) {
      await client.query('DELETE FROM com_orden_compra_det WHERE "ORCOMDET_NRO" = $1', [nro]);
      await insertItems(client, nro, data.detalle);
    }

    await client.query('COMMIT');
    return getById(nro);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const remove = async (nro) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM com_orden_compra_det WHERE "ORCOMDET_NRO" = $1', [nro]);
    await client.query('DELETE FROM com_orden_compra WHERE "ORCOM_NRO" = $1', [nro]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, create, update, remove };
