const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE CAST(e."EJ_CODIGO" AS TEXT) ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM cnt_ejercicio e WHERE e."EJ_EMPR" = 1 ${search ? 'AND CAST(e."EJ_CODIGO" AS TEXT) ILIKE $1' : ''}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { codigo: 'e."EJ_CODIGO"', fecha_ini: 'e."EJ_FEC_INICIAL"', fecha_fin: 'e."EJ_FEC_FINAL"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'e."EJ_CODIGO" DESC';
  const select = `
    SELECT e."EJ_EMPR"         AS ej_empr,
           e."EJ_CODIGO"       AS ej_codigo,
           e."EJ_FEC_INICIAL"  AS ej_fec_inicial,
           e."EJ_FEC_FINAL"    AS ej_fec_final,
           e."EJ_UTILIDAD"     AS ej_utilidad
    FROM cnt_ejercicio e
    WHERE e."EJ_EMPR" = 1 ${search ? 'AND CAST(e."EJ_CODIGO" AS TEXT) ILIKE $1' : ''}
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

const getById = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT "EJ_EMPR" AS ej_empr, "EJ_CODIGO" AS ej_codigo,
            "EJ_FEC_INICIAL" AS ej_fec_inicial, "EJ_FEC_FINAL" AS ej_fec_final,
            "EJ_UTILIDAD" AS ej_utilidad
     FROM cnt_ejercicio WHERE "EJ_EMPR" = 1 AND "EJ_CODIGO" = $1`,
    [codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Ejercicio no encontrado' };
  return rows[0];
};

const create = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("EJ_CODIGO"), 0) + 1 AS next FROM cnt_ejercicio WHERE "EJ_EMPR" = 1');
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO cnt_ejercicio ("EJ_EMPR","EJ_CODIGO","EJ_FEC_INICIAL","EJ_FEC_FINAL")
     VALUES (1,$1,$2,$3)`,
    [codigo, data.ej_fec_inicial, data.ej_fec_final]
  );
  return getById(codigo);
};

const update = async (codigo, data) => {
  const fields = []; const params = [];
  const map = {
    ej_fec_inicial: '"EJ_FEC_INICIAL"',
    ej_fec_final:   '"EJ_FEC_FINAL"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (fields.length) {
    params.push(codigo);
    await pool.query(`UPDATE cnt_ejercicio SET ${fields.join(', ')} WHERE "EJ_EMPR" = 1 AND "EJ_CODIGO" = $${params.length}`, params);
  }
  return getById(codigo);
};

const remove = async (codigo) => {
  await pool.query('DELETE FROM cnt_ejercicio WHERE "EJ_EMPR" = 1 AND "EJ_CODIGO" = $1', [codigo]);
};

module.exports = { getAll, getById, create, update, remove };
