const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'desc', ubicacion = '', estado = '' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  const conditions = [];
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(a."ART_DESC" ILIKE $${params.length} OR r."RES_GRUPO_DESC" ILIKE $${params.length} OR CAST(r."RES_NRO_PED" AS TEXT) ILIKE $${params.length} OR c."CLI_NOM" ILIKE $${params.length})`);
  }
  if (ubicacion) { params.push(ubicacion); conditions.push(`r."RES_GRUPO_DESC" = $${params.length}`); }
  if (estado)    { params.push(estado);    conditions.push(`r."RES_ESTADO" = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM stk_res_espacio r
     LEFT JOIN stk_articulo a ON a."ART_CODIGO" = r."RES_COD_ART"
     LEFT JOIN fac_pedido p ON p."PED_CLAVE" = r."RES_PED_CLAVE"
     LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = p."PED_CLI"
     ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);

  const allowedSort = {
    reserva:   'r."RES_COD_RESERVA"',
    articulo:  'a."ART_DESC"',
    ubicacion: 'r."RES_GRUPO_DESC"',
    desde:     'r."RES_FEC_DESDE"',
    hasta:     'r."RES_FEC_HASTA"',
    precio:    'r."RES_PRECIO"',
    pedido:    'r."RES_NRO_PED"',
    cliente:   'c."CLI_NOM"',
  };
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'r."RES_COD_RESERVA" DESC';

  const select = `
    SELECT r."RES_COD_RESERVA" AS res_cod_reserva,
           r."RES_COD_ART" AS res_cod_art, COALESCE(a."ART_DESC", r."RES_ART_DESC") AS art_desc,
           r."RES_COD_ALFA" AS res_cod_alfa,
           r."RES_FEC_DESDE" AS res_fec_desde, r."RES_FEC_HASTA" AS res_fec_hasta,
           r."RES_PRECIO" AS res_precio, r."RES_ESTADO" AS res_estado,
           r."RES_GRUPO" AS res_grupo, r."RES_LINEA" AS res_linea,
           r."RES_GRUPO_DESC" AS res_grupo_desc,
           r."RES_CANT" AS res_cant, r."RES_UM" AS res_um,
           r."RES_CANT_DIAS" AS res_cant_dias,
           r."RES_SEGUNDOS" AS res_segundos, r."RES_INSERCIONES" AS res_inserciones,
           r."RES_COD_INS" AS res_cod_ins, r."RES_TOT_SEG" AS res_tot_seg,
           r."RES_PED_CLAVE" AS res_ped_clave, r."RES_NRO_PED" AS res_nro_ped,
           r."RES_ITEM_PED" AS res_item_ped,
           r."RES_EST_IT" AS res_est_it, r."RES_FEC_EST_IT" AS res_fec_est_it,
           r."RES_OBS_IT" AS res_obs_it,
           c."CLI_NOM" AS cli_nom
    FROM stk_res_espacio r
    LEFT JOIN stk_articulo a ON a."ART_CODIGO" = r."RES_COD_ART"
    LEFT JOIN fac_pedido p ON p."PED_CLAVE" = r."RES_PED_CLAVE"
    LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = p."PED_CLI"
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

const getUbicaciones = async () => {
  const { rows } = await pool.query(
    `SELECT DISTINCT "RES_GRUPO_DESC" AS ubicacion FROM stk_res_espacio WHERE "RES_GRUPO_DESC" IS NOT NULL ORDER BY 1`
  );
  return rows.map((r) => r.ubicacion);
};

module.exports = { getAll, getUbicaciones };
