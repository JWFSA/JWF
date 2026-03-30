const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE cb."CTA_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fin_cuenta_bancaria cb ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: 'cb."CTA_CODIGO"', desc: 'cb."CTA_DESC"', banco: 'b."BCO_DESC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'cb."CTA_DESC" ASC';
  const select = `
    SELECT cb."CTA_EMPR" AS cta_empr, cb."CTA_CODIGO" AS cta_codigo, cb."CTA_DESC" AS cta_desc,
           cb."CTA_BCO" AS cta_bco, b."BCO_DESC" AS bco_desc,
           cb."CTA_TIPO_CTA" AS cta_tipo_cta, cb."CTA_MON" AS cta_mon, m."MON_DESC" AS mon_desc,
           cb."CTA_FEC_HABILIT" AS cta_fec_habilit
    FROM fin_cuenta_bancaria cb
    LEFT JOIN fin_banco b ON b."BCO_CODIGO" = cb."CTA_BCO"
    LEFT JOIN gen_moneda m ON m."MON_CODIGO" = cb."CTA_MON"
    ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getById = async (codigo) => {
  const { rows } = await pool.query(`
    SELECT cb."CTA_EMPR" AS cta_empr, cb."CTA_CODIGO" AS cta_codigo, cb."CTA_DESC" AS cta_desc,
           cb."CTA_BCO" AS cta_bco, b."BCO_DESC" AS bco_desc,
           cb."CTA_TIPO_CTA" AS cta_tipo_cta, cb."CTA_MON" AS cta_mon, m."MON_DESC" AS mon_desc,
           cb."CTA_FEC_HABILIT" AS cta_fec_habilit
    FROM fin_cuenta_bancaria cb
    LEFT JOIN fin_banco b ON b."BCO_CODIGO" = cb."CTA_BCO"
    LEFT JOIN gen_moneda m ON m."MON_CODIGO" = cb."CTA_MON"
    WHERE cb."CTA_EMPR" = 1 AND cb."CTA_CODIGO" = $1`, [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Cuenta bancaria no encontrada' };
  return rows[0];
};

const create = async (data) => {
  const { rows } = await pool.query(
    `SELECT COALESCE(MAX("CTA_CODIGO"), 0) + 1 AS next FROM fin_cuenta_bancaria WHERE "CTA_EMPR" = 1`
  );
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO fin_cuenta_bancaria ("CTA_EMPR","CTA_CODIGO","CTA_DESC","CTA_BCO","CTA_TIPO_CTA","CTA_MON","CTA_FEC_HABILIT")
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [1, codigo, data.cta_desc, data.cta_bco || null, data.cta_tipo_cta || null, data.cta_mon || null, data.cta_fec_habilit || null]
  );
  return getById(codigo);
};

const update = async (codigo, data) => {
  const fields = []; const params = [];
  const map = { cta_desc: '"CTA_DESC"', cta_bco: '"CTA_BCO"', cta_tipo_cta: '"CTA_TIPO_CTA"', cta_mon: '"CTA_MON"', cta_fec_habilit: '"CTA_FEC_HABILIT"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getById(codigo);
  params.push(codigo);
  await pool.query(`UPDATE fin_cuenta_bancaria SET ${fields.join(', ')} WHERE "CTA_EMPR" = 1 AND "CTA_CODIGO" = $${params.length}`, params);
  return getById(codigo);
};

const remove = async (codigo) => {
  await pool.query(`DELETE FROM fin_cuenta_bancaria WHERE "CTA_EMPR" = 1 AND "CTA_CODIGO" = $1`, [codigo]);
};

module.exports = { getAll, getById, create, update, remove };
