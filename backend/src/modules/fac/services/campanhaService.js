const pool = require('../../../config/db');

// ─── CAMPAÑAS ───────────────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (c."CAMP_NOMBRE" ILIKE $1 OR cl."CLI_NOM" ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM fac_campanha c
     LEFT JOIN fin_cliente cl ON cl."CLI_CODIGO" = c."CAMP_CLI"
     ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nombre:  'c."CAMP_NOMBRE"',
    cliente: 'cl."CLI_NOM"',
    vigente: 'c."CAMP_IND_VIGENTE"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'c."CAMP_NOMBRE" ASC';
  const select = `
    SELECT c."CAMP_CLI"          AS camp_cli,
           cl."CLI_NOM"          AS cli_nom,
           c."CAMP_NRO"          AS camp_nro,
           c."CAMP_NOMBRE"       AS camp_nombre,
           c."CAMP_IND_VIGENTE"  AS camp_ind_vigente
    FROM fac_campanha c
    LEFT JOIN fin_cliente cl ON cl."CLI_CODIGO" = c."CAMP_CLI"
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cli = data.camp_cli || 0;
    const { rows } = await client.query(
      'SELECT COALESCE(MAX("CAMP_NRO"), 0) + 1 AS next FROM fac_campanha WHERE "CAMP_CLI" = $1', [cli]
    );
    const nro = rows[0].next;
    await client.query(
      `INSERT INTO fac_campanha ("CAMP_CLI","CAMP_NRO","CAMP_NOMBRE","CAMP_IND_VIGENTE")
       VALUES ($1,$2,$3,$4)`,
      [cli, nro, data.camp_nombre, data.camp_ind_vigente || 'S']
    );
    await client.query('COMMIT');
    return { camp_cli: cli, camp_nro: nro, camp_nombre: data.camp_nombre, camp_ind_vigente: data.camp_ind_vigente || 'S' };
  } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
};

const update = async (cli, nro, data) => {
  const fields = []; const params = [];
  const map = { camp_nombre: '"CAMP_NOMBRE"', camp_ind_vigente: '"CAMP_IND_VIGENTE"' };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (fields.length) {
    params.push(cli, nro);
    await pool.query(
      `UPDATE fac_campanha SET ${fields.join(', ')} WHERE "CAMP_CLI" = $${params.length - 1} AND "CAMP_NRO" = $${params.length}`,
      params
    );
  }
};

const remove = async (cli, nro) => {
  await pool.query('DELETE FROM fac_campanha WHERE "CAMP_CLI" = $1 AND "CAMP_NRO" = $2', [cli, nro]);
};

const getByCliente = async (cli) => {
  const { rows } = await pool.query(
    `SELECT "CAMP_CLI" AS camp_cli, "CAMP_NRO" AS camp_nro, "CAMP_NOMBRE" AS camp_nombre, "CAMP_IND_VIGENTE" AS camp_ind_vigente
     FROM fac_campanha WHERE "CAMP_CLI" = $1 ORDER BY "CAMP_NRO"`, [cli]
  );
  return rows;
};

const getDistinctNames = async ({ search = '' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where = search ? 'WHERE "CAMP_NOMBRE" ILIKE $1' : '';
  const { rows } = await pool.query(
    `SELECT DISTINCT "CAMP_NOMBRE" AS camp_nombre FROM fac_campanha ${where} ORDER BY "CAMP_NOMBRE" LIMIT 50`,
    params
  );
  return rows.map((r) => r.camp_nombre);
};

module.exports = { getAll, getByCliente, getDistinctNames, create, update, remove };
