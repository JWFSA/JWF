const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false } = {}) => {
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

  const select = `SELECT "EMPR_CODIGO"        AS empr_codigo,
            "EMPR_RAZON_SOCIAL"  AS empr_razon_social,
            "EMPR_DIR"           AS empr_dir,
            "EMPR_TEL"           AS empr_tel,
            "EMPR_RUC"           AS empr_ruc,
            "EMPR_LOCALIDAD"     AS empr_localidad,
            "EMPR_CORREO_ELECT"  AS empr_correo_elect,
            "EMPR_PAGINA_WEB"    AS empr_pagina_web,
            "EMPR_IND_BLOQUEADO" AS empr_ind_bloqueado
     FROM gen_empresa ${where} ORDER BY "EMPR_RAZON_SOCIAL"`;

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

module.exports = { getAll, getById, getSucursales };
