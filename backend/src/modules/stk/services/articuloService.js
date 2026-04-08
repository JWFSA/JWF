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
            a."ART_GRUPO" AS art_grupo,
            a."ART_EST" AS art_est, a."ART_CODIGO_FABRICA" AS art_codigo_fabrica,
            a."ART_TIPO" AS art_tipo,
            a."ART_IMPU" AS art_impu, a."ART_IND_IMP" AS art_ind_imp,
            a."ART_TIPO_COMISION" AS art_tipo_comision,
            a."ART_IND_VENTA" AS art_ind_venta,
            a."ART_COD_ALFANUMERICO" AS art_cod_alfanumerico,
            a."ART_FACTOR_CONVERSION" AS art_factor_conversion,
            a."ART_CLASIFICACION" AS art_clasificacion, cl."CLAS_DESC" AS clas_desc,
            a."ART_PAIS" AS art_pais, p."PAIS_DESC" AS pais_desc,
            a."ART_PROV" AS art_prov, pv."PROV_RAZON_SOCIAL" AS prov_nom,
            a."ART_EMPAQUE" AS art_empaque,
            a."ART_CONTENIDO" AS art_contenido,
            a."ART_DATOS_TEC" AS art_datos_tec,
            a."ART_COLOR" AS art_color,
            a."ART_MED_BASE" AS art_med_base,
            a."ART_MED_ALTO" AS art_med_alto,
            a."ART_MED_TOTAL" AS art_med_total,
            a."ART_MAX_PORC_DCTO_VTA" AS art_max_porc_dcto_vta,
            a."ART_KG_UNID" AS art_kg_unid,
            a."ART_PORC_AUM_COSTO" AS art_porc_aum_costo
     FROM stk_articulo a
     LEFT JOIN stk_linea l ON l."LIN_CODIGO" = a."ART_LINEA"
     LEFT JOIN stk_marca m ON m."MARC_CODIGO" = a."ART_MARCA"
     LEFT JOIN stk_rubro r ON r."RUB_CODIGO" = a."ART_RUBRO"
     LEFT JOIN stk_clasificacion cl ON cl."CLAS_CODIGO" = a."ART_CLASIFICACION"
     LEFT JOIN gen_pais p ON p."PAIS_CODIGO" = a."ART_PAIS"
     LEFT JOIN fin_proveedor pv ON pv."PROV_CODIGO" = a."ART_PROV"
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
        "ART_LINEA", "ART_MARCA", "ART_RUBRO", "ART_GRUPO", "ART_EST", "ART_CODIGO_FABRICA", "ART_TIPO",
        "ART_IMPU", "ART_IND_IMP", "ART_TIPO_COMISION", "ART_IND_VENTA",
        "ART_COD_ALFANUMERICO", "ART_FACTOR_CONVERSION", "ART_CLASIFICACION",
        "ART_PAIS", "ART_PROV", "ART_EMPAQUE", "ART_CONTENIDO", "ART_DATOS_TEC",
        "ART_COLOR", "ART_MED_BASE", "ART_MED_ALTO", "ART_MED_TOTAL",
        "ART_MAX_PORC_DCTO_VTA", "ART_KG_UNID", "ART_PORC_AUM_COSTO")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)`,
    [
      codigo,
      data.art_desc,
      data.art_desc_abrev || null,
      data.art_unid_med || null,
      data.art_linea || null,
      data.art_marca || null,
      data.art_rubro || null,
      data.art_grupo || null,
      data.art_est || 'A',
      data.art_codigo_fabrica || null,
      data.art_tipo || 1,
      data.art_impu || null,
      data.art_ind_imp || null,
      data.art_tipo_comision || null,
      data.art_ind_venta || 'S',
      data.art_cod_alfanumerico || null,
      data.art_factor_conversion || null,
      data.art_clasificacion || null,
      data.art_pais || null,
      data.art_prov || null,
      data.art_empaque || null,
      data.art_contenido || null,
      data.art_datos_tec || null,
      data.art_color || null,
      data.art_med_base || null,
      data.art_med_alto || null,
      data.art_med_total || null,
      data.art_max_porc_dcto_vta || null,
      data.art_kg_unid || null,
      data.art_porc_aum_costo || null,
    ]
  );

  return getById(codigo);
};

const update = async (id, data) => {
  const fields = [];
  const params = [];

  const map = {
    art_desc: '"ART_DESC"', art_desc_abrev: '"ART_DESC_ABREV"', art_unid_med: '"ART_UNID_MED"',
    art_linea: '"ART_LINEA"', art_marca: '"ART_MARCA"', art_rubro: '"ART_RUBRO"', art_grupo: '"ART_GRUPO"',
    art_est: '"ART_EST"', art_codigo_fabrica: '"ART_CODIGO_FABRICA"', art_tipo: '"ART_TIPO"',
    art_impu: '"ART_IMPU"', art_ind_imp: '"ART_IND_IMP"',
    art_tipo_comision: '"ART_TIPO_COMISION"', art_ind_venta: '"ART_IND_VENTA"',
    art_cod_alfanumerico: '"ART_COD_ALFANUMERICO"', art_factor_conversion: '"ART_FACTOR_CONVERSION"',
    art_clasificacion: '"ART_CLASIFICACION"', art_pais: '"ART_PAIS"', art_prov: '"ART_PROV"',
    art_empaque: '"ART_EMPAQUE"', art_contenido: '"ART_CONTENIDO"', art_datos_tec: '"ART_DATOS_TEC"',
    art_color: '"ART_COLOR"', art_med_base: '"ART_MED_BASE"', art_med_alto: '"ART_MED_ALTO"',
    art_med_total: '"ART_MED_TOTAL"', art_max_porc_dcto_vta: '"ART_MAX_PORC_DCTO_VTA"',
    art_kg_unid: '"ART_KG_UNID"', art_porc_aum_costo: '"ART_PORC_AUM_COSTO"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }

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
