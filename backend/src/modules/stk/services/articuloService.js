const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc', linea = '', marca = '', rubro = '', estado = '' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  const conditions = [];
  if (search) { params.push(`%${search}%`); conditions.push(`(a."ART_DESC" ILIKE $${params.length} OR a."ART_DESC_ABREV" ILIKE $${params.length} OR a."ART_CODIGO_FABRICA" ILIKE $${params.length})`); }
  if (linea)  { params.push(Number(linea));  conditions.push(`a."ART_LINEA" = $${params.length}`); }
  if (marca)  { params.push(Number(marca));  conditions.push(`a."ART_MARCA" = $${params.length}`); }
  if (rubro)  { params.push(Number(rubro));  conditions.push(`a."ART_RUBRO" = $${params.length}`); }
  if (estado) { params.push(estado);         conditions.push(`a."ART_EST" = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const allowedSort = {
    cod: 'a."ART_CODIGO"', desc: 'a."ART_DESC"', abrev: 'a."ART_DESC_ABREV"',
    linea: 'l."LIN_DESC"', marca: 'm."MARC_DESC"', rubro: 'r."RUB_DESC"', estado: 'a."ART_EST"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'a."ART_DESC" ASC';
  const select = `SELECT a."ART_CODIGO" AS art_codigo, a."ART_DESC" AS art_desc,
            a."ART_DESC_ABREV" AS art_desc_abrev, a."ART_UNID_MED" AS art_unid_med,
            a."ART_LINEA" AS art_linea, l."LIN_DESC" AS lin_desc,
            a."ART_MARCA" AS art_marca, m."MARC_DESC" AS marc_desc,
            a."ART_RUBRO" AS art_rubro, r."RUB_DESC" AS rub_desc,
            a."ART_EST" AS art_est, a."ART_CODIGO_FABRICA" AS art_codigo_fabrica
     FROM stk_articulo a
     LEFT JOIN stk_linea l ON l."LIN_CODIGO" = a."ART_LINEA"
     LEFT JOIN stk_marca m ON m."MARC_CODIGO" = a."ART_MARCA"
     LEFT JOIN stk_rubro r ON r."RUB_CODIGO" = a."ART_RUBRO"
     ${where} ORDER BY ${orderBy}`;

  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }

  const countRes = await pool.query(`SELECT COUNT(*) FROM stk_articulo a ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT a."ART_CODIGO" AS art_codigo, a."ART_DESC" AS art_desc,
            a."ART_DESC_ABREV" AS art_desc_abrev, a."ART_UNID_MED" AS art_unid_med,
            a."ART_LINEA" AS art_linea, l."LIN_DESC" AS lin_desc,
            a."ART_MARCA" AS art_marca, m."MARC_DESC" AS marc_desc,
            a."ART_RUBRO" AS art_rubro, r."RUB_DESC" AS rub_desc,
            a."ART_EST" AS art_est, a."ART_CODIGO_FABRICA" AS art_codigo_fabrica,
            a."ART_TIPO" AS art_tipo
     FROM stk_articulo a
     LEFT JOIN stk_linea l ON l."LIN_CODIGO" = a."ART_LINEA"
     LEFT JOIN stk_marca m ON m."MARC_CODIGO" = a."ART_MARCA"
     LEFT JOIN stk_rubro r ON r."RUB_CODIGO" = a."ART_RUBRO"
     WHERE a."ART_CODIGO" = $1`,
    [id]
  );
  if (rows.length === 0) throw { status: 404, message: 'Artículo no encontrado' };
  return rows[0];
};

const create = async (data) => {
  const { rows: codeRows } = await pool.query(
    `SELECT COALESCE(MAX("ART_CODIGO"), 0) + 1 AS next_code FROM stk_articulo`
  );
  const codigo = codeRows[0].next_code;

  await pool.query(
    `INSERT INTO stk_articulo
       ("ART_CODIGO", "ART_DESC", "ART_DESC_ABREV", "ART_UNID_MED",
        "ART_LINEA", "ART_MARCA", "ART_RUBRO", "ART_EST", "ART_CODIGO_FABRICA", "ART_TIPO")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      codigo,
      data.art_desc,
      data.art_desc_abrev || null,
      data.art_unid_med || null,
      data.art_linea || null,
      data.art_marca || null,
      data.art_rubro || null,
      data.art_est || 'A',
      data.art_codigo_fabrica || null,
      data.art_tipo || 1,
    ]
  );

  return getById(codigo);
};

const update = async (id, data) => {
  const fields = [];
  const params = [];

  if (data.art_desc !== undefined)          { params.push(data.art_desc);          fields.push(`"ART_DESC" = $${params.length}`); }
  if (data.art_desc_abrev !== undefined)    { params.push(data.art_desc_abrev);    fields.push(`"ART_DESC_ABREV" = $${params.length}`); }
  if (data.art_unid_med !== undefined)      { params.push(data.art_unid_med);      fields.push(`"ART_UNID_MED" = $${params.length}`); }
  if (data.art_linea !== undefined)         { params.push(data.art_linea);         fields.push(`"ART_LINEA" = $${params.length}`); }
  if (data.art_marca !== undefined)         { params.push(data.art_marca);         fields.push(`"ART_MARCA" = $${params.length}`); }
  if (data.art_rubro !== undefined)         { params.push(data.art_rubro);         fields.push(`"ART_RUBRO" = $${params.length}`); }
  if (data.art_est !== undefined)           { params.push(data.art_est);           fields.push(`"ART_EST" = $${params.length}`); }
  if (data.art_codigo_fabrica !== undefined){ params.push(data.art_codigo_fabrica);fields.push(`"ART_CODIGO_FABRICA" = $${params.length}`); }

  if (fields.length === 0) return getById(id);

  params.push(id);
  await pool.query(
    `UPDATE stk_articulo SET ${fields.join(', ')} WHERE "ART_CODIGO" = $${params.length}`,
    params
  );

  return getById(id);
};

const remove = async (id) => {
  await pool.query('DELETE FROM stk_articulo WHERE "ART_CODIGO" = $1', [id]);
};

module.exports = { getAll, getById, create, update, remove };
