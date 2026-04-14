const pool = require('../../../config/db');

// ─── CHEQUES EMITIDOS ───────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (ch."CH_EMIT_BENEFICIARIO" ILIKE $1 OR CAST(ch."CH_EMIT_NRO" AS TEXT) ILIKE $1)`
    : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fin_cheque_emit ch ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nro:     'ch."CH_EMIT_NRO"',
    vto:     'ch."CH_EMIT_FEC_VTO"',
    benef:   'ch."CH_EMIT_BENEFICIARIO"',
    importe: 'ch."CH_EMIT_IMPORTE"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'ch."CH_EMIT_CLAVE" DESC';
  const select = `
    SELECT ch."CH_EMIT_CLAVE"          AS ch_emit_clave,
           ch."CH_EMIT_SERIE"          AS ch_emit_serie,
           ch."CH_EMIT_NRO"            AS ch_emit_nro,
           ch."CH_EMIT_FEC_VTO"        AS ch_emit_fec_vto,
           ch."CH_EMIT_IMPORTE"        AS ch_emit_importe,
           ch."CH_EMIT_BENEFICIARIO"   AS ch_emit_beneficiario,
           ch."CH_EMIT_CLAVE_FIN"      AS ch_emit_clave_fin,
           ch."CH_EMIT_CLAVE_FIN_CAN"  AS ch_emit_clave_fin_can
    FROM fin_cheque_emit ch
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

module.exports = { getAll };
