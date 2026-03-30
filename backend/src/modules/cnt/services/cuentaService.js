const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `AND (c."CTAC_DESC" ILIKE $1 OR CAST(c."CTAC_NRO" AS TEXT) ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM cnt_cuenta c WHERE c."CTAC_EMPR" = 1 ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nro:   'c."CTAC_NRO"',
    desc:  'c."CTAC_DESC"',
    nivel: 'c."CTAC_NIVEL"',
    grupo: 'c."CTAC_GRUPO"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'c."CTAC_NRO" ASC';
  const select = `
    SELECT c."CTAC_CLAVE"          AS ctac_clave,
           c."CTAC_NRO"            AS ctac_nro,
           c."CTAC_DESC"           AS ctac_desc,
           c."CTAC_NIVEL"          AS ctac_nivel,
           c."CTAC_RUBRO"          AS ctac_rubro,
           c."CTAC_CCOSTO"         AS ctac_ccosto,
           c."CTAC_GRUPO"          AS ctac_grupo,
           g."GRUP_DESC"           AS grupo_desc,
           c."CTAC_IND_IMPUTABLE"  AS ctac_ind_imputable,
           c."CTAC_CLAVE_PADRE"    AS ctac_clave_padre,
           c."CTAC_IND_MOV_VAR"    AS ctac_ind_mov_var
    FROM cnt_cuenta c
    LEFT JOIN cnt_grupo g ON g."GRUP_CODIGO" = c."CTAC_GRUPO"
    WHERE c."CTAC_EMPR" = 1 ${where}
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
    `SELECT c."CTAC_CLAVE"          AS ctac_clave,
            c."CTAC_EMPR"           AS ctac_empr,
            c."CTAC_NRO"            AS ctac_nro,
            c."CTAC_DESC"           AS ctac_desc,
            c."CTAC_NIVEL"          AS ctac_nivel,
            c."CTAC_RUBRO"          AS ctac_rubro,
            r."RUB_DESC"            AS rubro_desc,
            c."CTAC_CCOSTO"         AS ctac_ccosto,
            cc."CCO_DESC"           AS ccosto_desc,
            c."CTAC_GRUPO"          AS ctac_grupo,
            g."GRUP_DESC"           AS grupo_desc,
            c."CTAC_IND_IMPUTABLE"  AS ctac_ind_imputable,
            c."CTAC_CLAVE_PADRE"    AS ctac_clave_padre,
            c."CTAC_IND_MOV_VAR"    AS ctac_ind_mov_var,
            c."CTAC_LINEAS"         AS ctac_lineas
     FROM cnt_cuenta c
     LEFT JOIN cnt_grupo  g  ON g."GRUP_CODIGO"  = c."CTAC_GRUPO"
     LEFT JOIN cnt_rubro  r  ON r."RUB_CODIGO"   = c."CTAC_RUBRO"
     LEFT JOIN cnt_ccosto cc ON cc."CCO_CODIGO"  = c."CTAC_CCOSTO"
     WHERE c."CTAC_CLAVE" = $1`,
    [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Cuenta no encontrada' };
  return rows[0];
};

const create = async (data) => {
  const { rows } = await pool.query('SELECT COALESCE(MAX("CTAC_CLAVE"), 0) + 1 AS next FROM cnt_cuenta');
  const clave = rows[0].next;
  await pool.query(
    `INSERT INTO cnt_cuenta
     ("CTAC_CLAVE","CTAC_EMPR","CTAC_NRO","CTAC_DESC","CTAC_NIVEL",
      "CTAC_RUBRO","CTAC_CCOSTO","CTAC_GRUPO","CTAC_IND_IMPUTABLE",
      "CTAC_CLAVE_PADRE","CTAC_IND_MOV_VAR")
     VALUES ($1,1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      clave,
      data.ctac_nro,
      data.ctac_desc,
      data.ctac_nivel         || null,
      data.ctac_rubro         || null,
      data.ctac_ccosto        || null,
      data.ctac_grupo         || null,
      data.ctac_ind_imputable || 'N',
      data.ctac_clave_padre   || null,
      data.ctac_ind_mov_var   || null,
    ]
  );
  return getById(clave);
};

const update = async (clave, data) => {
  const fields = []; const params = [];
  const map = {
    ctac_nro:            '"CTAC_NRO"',
    ctac_desc:           '"CTAC_DESC"',
    ctac_nivel:          '"CTAC_NIVEL"',
    ctac_rubro:          '"CTAC_RUBRO"',
    ctac_ccosto:         '"CTAC_CCOSTO"',
    ctac_grupo:          '"CTAC_GRUPO"',
    ctac_ind_imputable:  '"CTAC_IND_IMPUTABLE"',
    ctac_clave_padre:    '"CTAC_CLAVE_PADRE"',
    ctac_ind_mov_var:    '"CTAC_IND_MOV_VAR"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (fields.length) {
    params.push(clave);
    await pool.query(`UPDATE cnt_cuenta SET ${fields.join(', ')} WHERE "CTAC_CLAVE" = $${params.length}`, params);
  }
  return getById(clave);
};

const remove = async (clave) => {
  await pool.query('DELETE FROM cnt_cuenta WHERE "CTAC_CLAVE" = $1', [clave]);
};

module.exports = { getAll, getById, create, update, remove };
