const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc',
  fechaDesde = '', fechaHasta = '', ejercicio = '' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = [];
  let filters = '';
  if (search) { params.push(`%${search}%`); filters += ` AND (a."ASI_OBS" ILIKE $${params.length} OR CAST(a."ASI_NRO" AS TEXT) ILIKE $${params.length})`; }
  if (fechaDesde) { params.push(fechaDesde); filters += ` AND a."ASI_FEC" >= $${params.length}`; }
  if (fechaHasta) { params.push(fechaHasta); filters += ` AND a."ASI_FEC" <= $${params.length}`; }
  if (ejercicio) { params.push(Number(ejercicio)); filters += ` AND a."ASI_EJERCICIO" = $${params.length}`; }

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM cnt_asiento a WHERE a."ASI_EMPR" = 1 ${filters}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nro:       'a."ASI_NRO"',
    fecha:     'a."ASI_FEC"',
    ejercicio: 'a."ASI_EJERCICIO"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'a."ASI_CLAVE" DESC';
  const select = `
    SELECT a."ASI_CLAVE"      AS asi_clave,
           a."ASI_NRO"        AS asi_nro,
           a."ASI_FEC"        AS asi_fec,
           a."ASI_OBS"        AS asi_obs,
           a."ASI_EJERCICIO"  AS asi_ejercicio,
           a."ASI_SIST"       AS asi_sist,
           a."ASI_LOGIN"      AS asi_login,
           a."ASI_FEC_GRAB"   AS asi_fec_grab
    FROM cnt_asiento a
    WHERE a."ASI_EMPR" = 1 ${filters}
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
    `SELECT a."ASI_CLAVE"      AS asi_clave,
            a."ASI_EMPR"       AS asi_empr,
            a."ASI_EJERCICIO"  AS asi_ejercicio,
            a."ASI_NRO"        AS asi_nro,
            a."ASI_FEC"        AS asi_fec,
            a."ASI_OBS"        AS asi_obs,
            a."ASI_LOGIN"      AS asi_login,
            a."ASI_FEC_GRAB"   AS asi_fec_grab,
            a."ASI_SIST"       AS asi_sist
     FROM cnt_asiento a
     WHERE a."ASI_CLAVE" = $1`,
    [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Asiento no encontrado' };

  const { rows: detalle } = await pool.query(
    `SELECT d."ASID_CLAVE_ASI"    AS asid_clave_asi,
            d."ASID_ITEM"         AS asid_item,
            d."ASID_CLAVE_CTACO"  AS asid_clave_ctaco,
            c."CTAC_NRO"          AS ctac_nro,
            c."CTAC_DESC"         AS ctac_desc,
            d."ASID_IND_DB_CR"    AS asid_ind_db_cr,
            d."ASID_IMPORTE"      AS asid_importe,
            d."ASID_TIPO_MOV"     AS asid_tipo_mov,
            d."ASID_NRO_DOC"      AS asid_nro_doc,
            d."ASID_DESC"         AS asid_desc,
            d."ASID_CONCEPTO"     AS asid_concepto,
            d."ASID_CCOSTO"       AS asid_ccosto
     FROM cnt_asiento_det d
     LEFT JOIN cnt_cuenta c ON c."CTAC_CLAVE" = d."ASID_CLAVE_CTACO"
     WHERE d."ASID_CLAVE_ASI" = $1
     ORDER BY d."ASID_ITEM"`,
    [clave]
  );

  return { ...rows[0], detalle };
};

const validateBalance = (detalle) => {
  let totalDebe = 0, totalHaber = 0;
  for (const d of detalle) {
    const importe = Number(d.asid_importe) || 0;
    if (d.asid_ind_db_cr === 'D') totalDebe += importe;
    else if (d.asid_ind_db_cr === 'C') totalHaber += importe;
  }
  if (Math.abs(totalDebe - totalHaber) > 0.01) {
    throw { status: 400, message: `El asiento no está balanceado: Debe (${totalDebe}) ≠ Haber (${totalHaber})` };
  }
};

const insertItems = async (client, clave, items) => {
  for (let i = 0; i < items.length; i++) {
    const d = items[i];
    await client.query(
      `INSERT INTO cnt_asiento_det
       ("ASID_CLAVE_ASI","ASID_ITEM","ASID_CLAVE_CTACO","ASID_IND_DB_CR",
        "ASID_IMPORTE","ASID_TIPO_MOV","ASID_NRO_DOC","ASID_DESC",
        "ASID_CONCEPTO","ASID_CCOSTO")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        clave, i + 1,
        d.asid_clave_ctaco || null,
        d.asid_ind_db_cr   || 'D',
        d.asid_importe     || 0,
        d.asid_tipo_mov    || null,
        d.asid_nro_doc     || null,
        d.asid_desc        || null,
        d.asid_concepto    || null,
        d.asid_ccosto      || null,
      ]
    );
  }
};

const create = async (data) => {
  if (data.detalle && data.detalle.length) validateBalance(data.detalle);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: claveRows } = await client.query('SELECT COALESCE(MAX("ASI_CLAVE"), 0) + 1 AS next FROM cnt_asiento');
    const clave = claveRows[0].next;
    const { rows: nroRows } = await client.query(
      'SELECT COALESCE(MAX("ASI_NRO"), 0) + 1 AS next FROM cnt_asiento WHERE "ASI_EMPR" = 1 AND "ASI_EJERCICIO" = $1',
      [data.asi_ejercicio]
    );
    const nro = nroRows[0].next;
    const now = new Date().toISOString().split('T')[0];

    await client.query(
      `INSERT INTO cnt_asiento
       ("ASI_CLAVE","ASI_EMPR","ASI_EJERCICIO","ASI_NRO","ASI_FEC","ASI_OBS",
        "ASI_FEC_GRAB","ASI_LOGIN","ASI_SIST")
       VALUES ($1,1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        clave,
        data.asi_ejercicio,
        nro,
        data.asi_fec,
        data.asi_obs   || null,
        now,
        data.asi_login || null,
        data.asi_sist  || null,
      ]
    );

    if (data.detalle && Array.isArray(data.detalle)) {
      await insertItems(client, clave, data.detalle);
    }

    await client.query('COMMIT');
    return getById(clave);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const update = async (clave, data) => {
  if (data.detalle && data.detalle.length) validateBalance(data.detalle);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const fields = []; const params = [];
    const map = {
      asi_fec:   '"ASI_FEC"',
      asi_obs:   '"ASI_OBS"',
    };
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
    }
    if (fields.length) {
      params.push(clave);
      await client.query(`UPDATE cnt_asiento SET ${fields.join(', ')} WHERE "ASI_CLAVE" = $${params.length}`, params);
    }

    if (data.detalle && Array.isArray(data.detalle)) {
      await client.query('DELETE FROM cnt_asiento_det WHERE "ASID_CLAVE_ASI" = $1', [clave]);
      await insertItems(client, clave, data.detalle);
    }

    await client.query('COMMIT');
    return getById(clave);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const remove = async (clave) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM cnt_asiento_det WHERE "ASID_CLAVE_ASI" = $1', [clave]);
    await client.query('DELETE FROM cnt_asiento WHERE "ASI_CLAVE" = $1', [clave]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, create, update, remove };
