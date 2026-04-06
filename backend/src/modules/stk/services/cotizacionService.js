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

module.exports = { getAll, create, update, remove };
