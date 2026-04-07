const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const where = search
    ? `WHERE (o."OPER_NOMBRE" ILIKE $1 OR o."OPER_APELLIDO" ILIKE $1 OR o."OPER_LOGIN" ILIKE $1)`
    : '';
  const searchParam = `%${search}%`;
  const countParams = search ? [searchParam] : [];

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS total FROM gen_operador o ${where}`,
    countParams
  );
  const total = parseInt(countRows[0].total);

  const allowedSort = {
    cod: 'o."OPER_CODIGO"', nom: 'o."OPER_NOMBRE"', ape: 'o."OPER_APELLIDO"',
    login: 'o."OPER_LOGIN"', empr: 'e."EMPR_RAZON_SOCIAL"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'o."OPER_NOMBRE" ASC, o."OPER_APELLIDO" ASC';

  const select = `SELECT o."OPER_CODIGO"       AS oper_codigo,
            o."OPER_NOMBRE"       AS oper_nombre,
            o."OPER_APELLIDO"     AS oper_apellido,
            o."OPER_LOGIN"        AS oper_login,
            o."OPER_EMAIL"        AS oper_email,
            o."OPER_IND_ADMIN"    AS oper_ind_admin,
            o."OPER_IND_DESC"     AS oper_ind_desc,
            o."OPER_EMPR"         AS oper_empr,
            e."EMPR_RAZON_SOCIAL" AS empr_razon_social,
            o."OPER_SUC"          AS oper_suc,
            s."SUC_DESC"          AS suc_desc
     FROM gen_operador o
     LEFT JOIN gen_empresa e ON e."EMPR_CODIGO" = o."OPER_EMPR"
     LEFT JOIN gen_sucursal s ON s."SUC_EMPR" = o."OPER_EMPR" AND s."SUC_CODIGO" = o."OPER_SUC"
     ${where}
     ORDER BY ${orderBy}`;

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
    `SELECT o."OPER_CODIGO"       AS oper_codigo,
            o."OPER_NOMBRE"       AS oper_nombre,
            o."OPER_APELLIDO"     AS oper_apellido,
            o."OPER_LOGIN"        AS oper_login,
            o."OPER_EMAIL"        AS oper_email,
            o."OPER_IND_ADMIN"    AS oper_ind_admin,
            o."OPER_IND_DESC"     AS oper_ind_desc,
            o."OPER_EMPR"         AS oper_empr,
            o."OPER_SUC"          AS oper_suc,
            o."OPER_DEP"          AS oper_dep,
            o."OPER_DPTO"         AS oper_dpto,
            o."OPER_SEC"          AS oper_sec,
            o."OPER_MAX_SESSIONS" AS oper_max_sessions,
            o."OPER_GERENTE"      AS oper_gerente,
            o."OPER_OPERARIO"     AS oper_operario
     FROM gen_operador o
     WHERE o."OPER_CODIGO" = $1`,
    [codigo]
  );
  if (rows.length === 0) throw { status: 404, message: 'Operador no encontrado' };

  const roles = await pool.query(
    `SELECT r."ROL_CODIGO" AS rol_codigo, r."ROL_NOMBRE" AS rol_nombre
     FROM gen_operador_rol opr
     JOIN gen_rol r ON r."ROL_CODIGO" = opr."OPRO_ROL"
     WHERE opr."OPRO_OPERADOR" = $1`,
    [codigo]
  );

  return { ...rows[0], roles: roles.rows };
};

const create = async (data) => {
  const { nombre, apellido, login, password, email, indAdmin, empr, suc, dep, dpto, sec, maxSessions, roles } = data;

  if (!password) throw { status: 400, message: 'La contraseña es requerida' };

  const { rows: existing } = await pool.query(
    'SELECT "OPER_CODIGO" FROM gen_operador WHERE "OPER_LOGIN" = $1',
    [login]
  );
  if (existing.length > 0) throw { status: 409, message: 'El login ya existe' };

  const { rows: maxRow } = await pool.query(
    'SELECT COALESCE(MAX("OPER_CODIGO"), 0) + 1 AS next FROM gen_operador'
  );
  const codigo = maxRow[0].next;
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO gen_operador
      ("OPER_CODIGO", "OPER_NOMBRE", "OPER_APELLIDO", "OPER_LOGIN", "OPER_DESC_ABREV",
       "OPER_PASSWORD", "OPER_EMAIL", "OPER_IND_ADMIN", "OPER_EMPR", "OPER_SUC",
       "OPER_DEP", "OPER_DPTO", "OPER_SEC", "OPER_MAX_SESSIONS", "OPER_IND_DESC")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'N')`,
    [
      codigo, nombre, apellido || null, login,
      (login || '').substring(0, 4).toUpperCase(),
      hash, email || null, indAdmin || 'N',
      empr || null, suc || null, dep || null, dpto || null,
      sec || null, maxSessions || 1,
    ]
  );

  if (roles?.length) await assignRoles(codigo, roles);

  return getById(codigo);
};

const update = async (codigo, data) => {
  const { nombre, apellido, password, email, indAdmin, empr, suc, dep, dpto, sec, maxSessions, indDesc, roles } = data;

  const fields = [
    `"OPER_NOMBRE" = $2`, `"OPER_APELLIDO" = $3`, `"OPER_EMAIL" = $4`,
    `"OPER_IND_ADMIN" = $5`, `"OPER_EMPR" = $6`, `"OPER_SUC" = $7`,
    `"OPER_DEP" = $8`, `"OPER_DPTO" = $9`, `"OPER_SEC" = $10`,
    `"OPER_MAX_SESSIONS" = $11`, `"OPER_IND_DESC" = $12`,
  ];
  const params = [
    codigo, nombre, apellido || null, email || null, indAdmin || 'N',
    empr || null, suc || null, dep || null, dpto || null,
    sec || null, maxSessions || 1, indDesc || 'N',
  ];

  if (password) {
    const hash = await bcrypt.hash(password, 10);
    fields.push(`"OPER_PASSWORD" = $${params.length + 1}`);
    params.push(hash);
  }

  await pool.query(
    `UPDATE gen_operador SET ${fields.join(', ')} WHERE "OPER_CODIGO" = $1`,
    params
  );

  if (roles !== undefined) await assignRoles(codigo, roles);

  return getById(codigo);
};

const assignRoles = async (codigo, roles) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM gen_operador_rol WHERE "OPRO_OPERADOR" = $1', [codigo]);
    for (const rol of roles) {
      await client.query(
        'INSERT INTO gen_operador_rol ("OPRO_OPERADOR", "OPRO_ROL") VALUES ($1, $2)',
        [codigo, rol]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  return getById(codigo);
};

module.exports = { getAll, getById, create, update, assignRoles };
