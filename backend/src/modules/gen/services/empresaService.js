const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const where = search
    ? `WHERE ("EMPR_RAZON_SOCIAL" ILIKE $1 OR "EMPR_RUC" ILIKE $1)`
    : '';
  const searchParam = `%${search}%`;
  const countParams = search ? [searchParam] : [];

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS total FROM gen_empresa ${where}`,
    countParams
  );
  const total = parseInt(countRows[0].total);

  const allowedSort = { cod: '"EMPR_CODIGO"', nom: '"EMPR_RAZON_SOCIAL"', ruc: '"EMPR_RUC"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : '"EMPR_RAZON_SOCIAL" ASC';

  const select = `SELECT "EMPR_CODIGO"        AS empr_codigo,
            "EMPR_RAZON_SOCIAL"  AS empr_razon_social,
            "EMPR_DIR"           AS empr_dir,
            "EMPR_TEL"           AS empr_tel,
            "EMPR_RUC"           AS empr_ruc,
            "EMPR_LOCALIDAD"     AS empr_localidad,
            "EMPR_CORREO_ELECT"  AS empr_correo_elect,
            "EMPR_PAGINA_WEB"    AS empr_pagina_web,
            "EMPR_IND_BLOQUEADO" AS empr_ind_bloqueado
     FROM gen_empresa ${where} ORDER BY ${orderBy}`;

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
    `SELECT "EMPR_CODIGO"        AS empr_codigo,
            "EMPR_RAZON_SOCIAL"  AS empr_razon_social,
            "EMPR_DIR"           AS empr_dir,
            "EMPR_TEL"           AS empr_tel,
            "EMPR_FAX"           AS empr_fax,
            "EMPR_RUC"           AS empr_ruc,
            "EMPR_LOCALIDAD"     AS empr_localidad,
            "EMPR_CORREO_ELECT"  AS empr_correo_elect,
            "EMPR_PAGINA_WEB"    AS empr_pagina_web,
            "EMPR_IND_BLOQUEADO" AS empr_ind_bloqueado
     FROM gen_empresa WHERE "EMPR_CODIGO" = $1`,
    [codigo]
  );
  if (rows.length === 0) throw { status: 404, message: 'Empresa no encontrada' };
  return rows[0];
};

const getSucursales = async (emprCodigo) => {
  const { rows } = await pool.query(
    `SELECT "SUC_CODIGO"           AS suc_codigo,
            "SUC_DESC"             AS suc_desc,
            "SUC_DIR"              AS suc_dir,
            "SUC_TEL"              AS suc_tel,
            "SUC_LOCALIDAD"        AS suc_localidad,
            "SUC_IND_CASA_CENTRAL" AS suc_ind_casa_central
     FROM gen_sucursal WHERE "SUC_EMPR" = $1 ORDER BY "SUC_DESC"`,
    [emprCodigo]
  );
  return rows;
};

const create = async (data) => {
  const { rows: maxRow } = await pool.query(
    'SELECT COALESCE(MAX("EMPR_CODIGO"), 0) + 1 AS next FROM gen_empresa'
  );
  const codigo = maxRow[0].next;
  await pool.query(
    `INSERT INTO gen_empresa
       ("EMPR_CODIGO", "EMPR_RAZON_SOCIAL", "EMPR_RUC", "EMPR_DIR", "EMPR_TEL",
        "EMPR_FAX", "EMPR_LOCALIDAD", "EMPR_CORREO_ELECT", "EMPR_PAGINA_WEB", "EMPR_IND_BLOQUEADO")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      codigo,
      data.empr_razon_social,
      data.empr_ruc       || null,
      data.empr_dir       || null,
      data.empr_tel       || null,
      data.empr_fax       || null,
      data.empr_localidad || null,
      data.empr_correo_elect || null,
      data.empr_pagina_web   || null,
      data.empr_ind_bloqueado || 'N',
    ]
  );
  return getById(codigo);
};

const update = async (codigo, data) => {
  const fields = [];
  const params = [];

  const map = {
    empr_razon_social:  '"EMPR_RAZON_SOCIAL"',
    empr_ruc:           '"EMPR_RUC"',
    empr_dir:           '"EMPR_DIR"',
    empr_tel:           '"EMPR_TEL"',
    empr_fax:           '"EMPR_FAX"',
    empr_localidad:     '"EMPR_LOCALIDAD"',
    empr_correo_elect:  '"EMPR_CORREO_ELECT"',
    empr_pagina_web:    '"EMPR_PAGINA_WEB"',
    empr_ind_bloqueado: '"EMPR_IND_BLOQUEADO"',
  };

  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) {
      params.push(data[key]);
      fields.push(`${col} = $${params.length}`);
    }
  }

  if (fields.length === 0) return getById(codigo);

  params.push(codigo);
  await pool.query(
    `UPDATE gen_empresa SET ${fields.join(', ')} WHERE "EMPR_CODIGO" = $${params.length}`,
    params
  );
  return getById(codigo);
};

const createSucursal = async (emprCodigo, data) => {
  const { rows: maxRow } = await pool.query(
    'SELECT COALESCE(MAX("SUC_CODIGO"), 0) + 1 AS next FROM gen_sucursal WHERE "SUC_EMPR" = $1',
    [emprCodigo]
  );
  const codigo = maxRow[0].next;
  await pool.query(
    `INSERT INTO gen_sucursal
       ("SUC_EMPR", "SUC_CODIGO", "SUC_DESC", "SUC_DIR", "SUC_TEL", "SUC_FAX",
        "SUC_LOCALIDAD", "SUC_IND_CASA_CENTRAL")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      emprCodigo,
      codigo,
      data.suc_desc,
      data.suc_dir             || null,
      data.suc_tel             || null,
      data.suc_fax             || null,
      data.suc_localidad       || null,
      data.suc_ind_casa_central || 'N',
    ]
  );
  return getSucursales(emprCodigo);
};

const updateSucursal = async (emprCodigo, sucCodigo, data) => {
  const fields = [];
  const params = [];

  const map = {
    suc_desc:              '"SUC_DESC"',
    suc_dir:               '"SUC_DIR"',
    suc_tel:               '"SUC_TEL"',
    suc_fax:               '"SUC_FAX"',
    suc_localidad:         '"SUC_LOCALIDAD"',
    suc_ind_casa_central:  '"SUC_IND_CASA_CENTRAL"',
  };

  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) {
      params.push(data[key]);
      fields.push(`${col} = $${params.length}`);
    }
  }

  if (fields.length === 0) return getSucursales(emprCodigo);

  params.push(emprCodigo, sucCodigo);
  await pool.query(
    `UPDATE gen_sucursal SET ${fields.join(', ')}
     WHERE "SUC_EMPR" = $${params.length - 1} AND "SUC_CODIGO" = $${params.length}`,
    params
  );
  return getSucursales(emprCodigo);
};

const deleteSucursal = async (emprCodigo, sucCodigo) => {
  await pool.query(
    'DELETE FROM gen_sucursal WHERE "SUC_EMPR" = $1 AND "SUC_CODIGO" = $2',
    [emprCodigo, sucCodigo]
  );
};

module.exports = { getAll, getById, getSucursales, create, update, createSucursal, updateSucursal, deleteSucursal };
