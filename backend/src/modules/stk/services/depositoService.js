const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search ? `WHERE "DEP_DESC" ILIKE $1` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM stk_deposito ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { cod: '"DEP_CODIGO"', desc: '"DEP_DESC"', empr: '"DEP_EMPR"', suc: '"DEP_SUC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"DEP_EMPR" ASC, "DEP_SUC" ASC, "DEP_CODIGO" ASC';
  const select = `SELECT "DEP_EMPR" AS dep_empr, "DEP_SUC" AS dep_suc, "DEP_CODIGO" AS dep_codigo, "DEP_DESC" AS dep_desc FROM stk_deposito ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getById = async (empr, suc, codigo) => {
  const { rows } = await pool.query(
    `SELECT "DEP_EMPR" AS dep_empr, "DEP_SUC" AS dep_suc, "DEP_CODIGO" AS dep_codigo, "DEP_DESC" AS dep_desc
     FROM stk_deposito WHERE "DEP_EMPR" = $1 AND "DEP_SUC" = $2 AND "DEP_CODIGO" = $3`,
    [empr, suc, codigo]
  );
  if (!rows.length) throw { status: 404, message: 'Depósito no encontrado' };
  return rows[0];
};

const create = async (data) => {
  const { rows } = await pool.query(
    'SELECT COALESCE(MAX("DEP_CODIGO"), 0) + 1 AS next FROM stk_deposito WHERE "DEP_EMPR" = $1 AND "DEP_SUC" = $2',
    [data.dep_empr, data.dep_suc]
  );
  const codigo = rows[0].next;
  await pool.query(
    `INSERT INTO stk_deposito ("DEP_EMPR","DEP_SUC","DEP_CODIGO","DEP_DESC") VALUES ($1,$2,$3,$4)`,
    [data.dep_empr, data.dep_suc, codigo, data.dep_desc]
  );
  return getById(data.dep_empr, data.dep_suc, codigo);
};

const update = async (empr, suc, codigo, data) => {
  await pool.query(
    'UPDATE stk_deposito SET "DEP_DESC" = $1 WHERE "DEP_EMPR" = $2 AND "DEP_SUC" = $3 AND "DEP_CODIGO" = $4',
    [data.dep_desc, empr, suc, codigo]
  );
  return getById(empr, suc, codigo);
};

const remove = async (empr, suc, codigo) => {
  await pool.query(
    'DELETE FROM stk_deposito WHERE "DEP_EMPR" = $1 AND "DEP_SUC" = $2 AND "DEP_CODIGO" = $3',
    [empr, suc, codigo]
  );
};

module.exports = { getAll, getById, create, update, remove };
