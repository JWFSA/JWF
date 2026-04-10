const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'desc', moneda = '' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  const conditions = [];
  if (moneda) { params.push(Number(moneda)); conditions.push(`c."COT_MON" = $${params.length}`); }
  if (search) { params.push(`%${search}%`); conditions.push(`(CAST(c."COT_FEC" AS TEXT) ILIKE $${params.length} OR m."MON_DESC" ILIKE $${params.length})`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM stk_cotizacion c LEFT JOIN gen_moneda m ON m."MON_CODIGO" = c."COT_MON" ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);

  const allowedSort = {
    fecha: 'c."COT_FEC"', moneda: 'm."MON_DESC"', tasa: 'c."COT_TASA"',
  };
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'c."COT_FEC" DESC, c."COT_MON" ASC';

  const select = `
    SELECT c."COT_FEC" AS cot_fec, c."COT_MON" AS cot_mon, m."MON_DESC" AS mon_desc,
           m."MON_SIMBOLO" AS mon_simbolo,
           c."COT_TASA" AS cot_tasa, c."COT_TASA_COM" AS cot_tasa_com,
           c."COT_TASA_VTA_CNT" AS cot_tasa_vta_cnt, c."COT_TASA_COM_CNT" AS cot_tasa_com_cnt
    FROM stk_cotizacion c
    LEFT JOIN gen_moneda m ON m."MON_CODIGO" = c."COT_MON"
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

const create = async (data) => {
  const { cot_fec, cot_mon, cot_tasa, cot_tasa_com } = data;
  if (!cot_fec || !cot_mon || cot_tasa == null) throw { status: 400, message: 'Fecha, moneda y tasa son requeridos' };

  // Verificar si ya existe
  const { rows: existing } = await pool.query(
    'SELECT 1 FROM stk_cotizacion WHERE "COT_FEC" = $1 AND "COT_MON" = $2',
    [cot_fec, cot_mon]
  );
  if (existing.length) throw { status: 409, message: 'Ya existe una cotización para esa fecha y moneda' };

  await pool.query(
    `INSERT INTO stk_cotizacion ("COT_FEC","COT_MON","COT_TASA","COT_TASA_COM","COT_TASA_VTA_CNT","COT_TASA_COM_CNT")
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [cot_fec, cot_mon, cot_tasa, cot_tasa_com || null, null, null]
  );
  return { cot_fec, cot_mon, cot_tasa };
};

const update = async (fec, mon, data) => {
  const fields = []; const params = [];
  if (data.cot_tasa !== undefined) { params.push(data.cot_tasa); fields.push(`"COT_TASA" = $${params.length}`); }
  if (data.cot_tasa_com !== undefined) { params.push(data.cot_tasa_com); fields.push(`"COT_TASA_COM" = $${params.length}`); }
  if (!fields.length) throw { status: 400, message: 'Nada que actualizar' };
  params.push(fec, mon);
  const { rowCount } = await pool.query(
    `UPDATE stk_cotizacion SET ${fields.join(', ')} WHERE "COT_FEC" = $${params.length - 1} AND "COT_MON" = $${params.length}`,
    params
  );
  if (!rowCount) throw { status: 404, message: 'Cotización no encontrada' };
  return { cot_fec: fec, cot_mon: mon, ...data };
};

const remove = async (fec, mon) => {
  const { rowCount } = await pool.query(
    'DELETE FROM stk_cotizacion WHERE "COT_FEC" = $1 AND "COT_MON" = $2',
    [fec, mon]
  );
  if (!rowCount) throw { status: 404, message: 'Cotización no encontrada' };
};

// Mapeo de ISO code (Cambios Chaco) → código moneda interno (gen_moneda)
const ISO_TO_MON = { USD: 2, BRL: 4, EUR: 5, GBP: 6 };

const syncFromCambiosChaco = async () => {
  const res = await fetch('http://www.cambioschaco.com.py/api/branch_office/1/exchange', {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw { status: 502, message: `Cambios Chaco respondió ${res.status}` };
  const json = await res.json();
  if (!json.items?.length) throw { status: 502, message: 'Respuesta vacía de Cambios Chaco' };

  const today = new Date().toISOString().split('T')[0];
  const client = await pool.connect();
  const synced = [];

  try {
    await client.query('BEGIN');

    for (const item of json.items) {
      const monCodigo = ISO_TO_MON[item.isoCode];
      if (!monCodigo) continue;
      if (!item.salePrice && !item.purchasePrice) continue;

      const vta = item.salePrice || null;
      const com = item.purchasePrice || null;

      // UPSERT en stk_cotizacion
      const { rows: existing } = await client.query(
        'SELECT 1 FROM stk_cotizacion WHERE "COT_FEC" = $1 AND "COT_MON" = $2',
        [today, monCodigo]
      );
      if (existing.length) {
        await client.query(
          `UPDATE stk_cotizacion SET "COT_TASA" = $1, "COT_TASA_COM" = $2
           WHERE "COT_FEC" = $3 AND "COT_MON" = $4`,
          [vta, com, today, monCodigo]
        );
      } else {
        await client.query(
          `INSERT INTO stk_cotizacion ("COT_FEC","COT_MON","COT_TASA","COT_TASA_COM","COT_TASA_VTA_CNT","COT_TASA_COM_CNT")
           VALUES ($1,$2,$3,$4,NULL,NULL)`,
          [today, monCodigo, vta, com]
        );
      }

      // Actualizar tasas vigentes en gen_moneda
      await client.query(
        `UPDATE gen_moneda SET "MON_TASA_OFIC_VTA" = COALESCE($1, "MON_TASA_OFIC_VTA"),
                               "MON_TASA_OFIC_COMP" = COALESCE($2, "MON_TASA_OFIC_COMP"),
                               "MON_TASA_VTA" = COALESCE($1, "MON_TASA_VTA"),
                               "MON_TASA_COMP" = COALESCE($2, "MON_TASA_COMP")
         WHERE "MON_CODIGO" = $3`,
        [vta, com, monCodigo]
      );

      synced.push({ moneda: item.isoCode, mon_codigo: monCodigo, venta: vta, compra: com });
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return { fecha: today, actualizadas: synced.length, detalle: synced };
};

module.exports = { getAll, create, update, remove, syncFromCambiosChaco };
