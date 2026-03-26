const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const where = search ? `WHERE "ROL_NOMBRE" ILIKE $1` : '';
  const searchParam = `%${search}%`;
  const countParams = search ? [searchParam] : [];

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS total FROM gen_rol ${where}`,
    countParams
  );
  const total = parseInt(countRows[0].total);

  const allowedSort = { cod: '"ROL_CODIGO"', nom: '"ROL_NOMBRE"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"ROL_NOMBRE" ASC';

  const select = `SELECT "ROL_CODIGO" AS rol_codigo, "ROL_NOMBRE" AS rol_nombre
     FROM gen_rol ${where} ORDER BY ${orderBy}`;

  let rows;
  if (all) {
    ({ rows } = await pool.query(select, countParams));
  } else {
    const offset = (page - 1) * limit;
    const dataParams = search ? [searchParam, limit, offset] : [limit, offset];
    const pLimit  = search ? '$2' : '$1';
    const pOffset = search ? '$3' : '$2';
    ({ rows } = await pool.query(`${select} LIMIT ${pLimit} OFFSET ${pOffset}`, dataParams));
  }

  return {
    data: rows,
    pagination: { total, page: all ? 1 : page, limit: all ? total : limit, totalPages: all ? 1 : Math.ceil(total / limit) },
  };
};

const getById = async (codigo) => {
  const { rows } = await pool.query(
    'SELECT "ROL_CODIGO" AS rol_codigo, "ROL_NOMBRE" AS rol_nombre FROM gen_rol WHERE "ROL_CODIGO" = $1',
    [codigo]
  );
  if (rows.length === 0) throw { status: 404, message: 'Rol no encontrado' };

  const programas = await pool.query(
    `SELECT p."PROG_CLAVE"   AS prog_clave,
            p."PROG_DESC"    AS prog_desc,
            p."PROG_SISTEMA" AS prog_sistema,
            s."SIST_DESC"    AS sist_desc
     FROM gen_rol_programa rp
     JOIN gen_programa p ON p."PROG_CLAVE" = rp."ROPR_PROGRAMA"
     JOIN gen_sistema s ON s."SIST_CODIGO" = p."PROG_SISTEMA"
     WHERE rp."ROPR_ROL" = $1
     ORDER BY s."SIST_DESC", p."PROG_DESC"`,
    [codigo]
  );

  return { ...rows[0], programas: programas.rows };
};

const create = async ({ nombre }) => {
  const { rows: maxRow } = await pool.query(
    'SELECT COALESCE(MAX("ROL_CODIGO"), 0) + 1 AS next FROM gen_rol'
  );
  const codigo = maxRow[0].next;
  await pool.query(
    'INSERT INTO gen_rol ("ROL_CODIGO", "ROL_NOMBRE") VALUES ($1, $2)',
    [codigo, nombre]
  );
  return getById(codigo);
};

const update = async (codigo, { nombre }) => {
  await pool.query(
    'UPDATE gen_rol SET "ROL_NOMBRE" = $2 WHERE "ROL_CODIGO" = $1',
    [codigo, nombre]
  );
  return getById(codigo);
};

const remove = async (codigo) => {
  await pool.query('DELETE FROM gen_rol_programa WHERE "ROPR_ROL" = $1', [codigo]);
  await pool.query('DELETE FROM gen_operador_rol WHERE "OPRO_ROL" = $1', [codigo]);
  await pool.query('DELETE FROM gen_rol WHERE "ROL_CODIGO" = $1', [codigo]);
};

const assignProgramas = async (codigo, programas) => {
  await pool.query('DELETE FROM gen_rol_programa WHERE "ROPR_ROL" = $1', [codigo]);
  for (const prog of programas) {
    await pool.query(
      'INSERT INTO gen_rol_programa ("ROPR_ROL", "ROPR_PROGRAMA") VALUES ($1, $2)',
      [codigo, prog]
    );
  }
  return getById(codigo);
};

module.exports = { getAll, getById, create, update, remove, assignProgramas };
