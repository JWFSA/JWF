const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  const conditions = [];
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(pp."PP_CLI_NOM" ILIKE $${params.length} OR CAST(pp."PP_NRO" AS TEXT) ILIKE $${params.length})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM prd_pedido_produccion pp ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = { nro: 'pp."PP_NRO"', fecha: 'pp."PP_FEC_EMIS"', cliente: 'pp."PP_CLI_NOM"' };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'pp."PP_CLAVE" DESC';

  const select = `
    SELECT pp."PP_CLAVE" AS pp_clave, pp."PP_NRO" AS pp_nro, pp."PP_FEC_EMIS" AS pp_fec_emis,
           pp."PP_CLI" AS pp_cli, pp."PP_CLI_NOM" AS pp_cli_nom,
           pp."PP_CLAVE_PED" AS pp_clave_ped, pp."PP_NRO_PEDIDO" AS pp_nro_pedido,
           pp."PP_FEC_ENT" AS pp_fec_ent, pp."PP_ESTADO" AS pp_estado,
           pp."PP_DISENHO" AS pp_disenho,
           (SELECT COUNT(*) FROM prd_pedido_produccion_det d WHERE d."PPDET_CLAVE_DET" = pp."PP_CLAVE") AS cant_items
    FROM prd_pedido_produccion pp
    ${where} ORDER BY ${orderBy}`;
  if (all) {
    const { rows } = await pool.query(select, params);
    return { data: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
  }
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(`${select} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
  return { data: rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT pp.* FROM prd_pedido_produccion pp WHERE pp."PP_CLAVE" = $1`, [id]
  );
  if (!rows.length) throw { status: 404, message: 'Pedido de producción no encontrado' };
  const pp = {};
  for (const [k, v] of Object.entries(rows[0])) { pp[k.toLowerCase()] = v; }

  const { rows: items } = await pool.query(
    `SELECT d."PPDET_CLAVE_DET" AS ppdet_clave_det, d."PPDET_ITEM" AS ppdet_item,
            d."PPDET_ART" AS ppdet_art, a."ART_DESC" AS art_desc,
            d."PPDET_CANT" AS ppdet_cant, d."PPDET_UM" AS ppdet_um,
            d."PPDET_MEDIDA" AS ppdet_medida, d."PPDET_DESC_LARGA" AS ppdet_desc_larga,
            d."PPDET_DESCRIPCION" AS ppdet_descripcion, d."PPDET_OBS" AS ppdet_obs,
            d."PPDET_MED_LARGO" AS ppdet_med_largo, d."PPDET_MED_ANCHO" AS ppdet_med_ancho,
            d."PPDET_MED_ALTO" AS ppdet_med_alto,
            d."PPDET_FEC_TERM" AS ppdet_fec_term, d."PPDET_FEC_PREV" AS ppdet_fec_prev,
            d."PPDET_CLAVE_OT" AS ppdet_clave_ot, d."PPDET_OT" AS ppdet_ot
     FROM prd_pedido_produccion_det d
     LEFT JOIN stk_articulo a ON a."ART_CODIGO" = d."PPDET_ART"
     WHERE d."PPDET_CLAVE_DET" = $1
     ORDER BY d."PPDET_ITEM"`, [id]
  );
  pp.items = items;
  return pp;
};

const crearDesdePedido = async (pedidoClave, login = 'SISTEMA') => {
  const pedidoService = require('../../fac/services/pedidoService');
  const pedido = await pedidoService.getById(pedidoClave);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [{ next: clave }] } = await client.query('SELECT COALESCE(MAX("PP_CLAVE"), 0) + 1 AS next FROM prd_pedido_produccion');
    const { rows: [{ next: nro }] } = await client.query('SELECT COALESCE(MAX("PP_NRO"), 0) + 1 AS next FROM prd_pedido_produccion WHERE "PP_EMPR" = 1 AND "PP_SUC" = 1');
    const hoy = new Date().toISOString().split('T')[0];

    await client.query(
      `INSERT INTO prd_pedido_produccion
       ("PP_CLAVE","PP_EMPR","PP_SUC","PP_NRO","PP_FEC_EMIS","PP_CLI","PP_CLI_NOM",
        "PP_CLI_TEL","PP_CLI_CONTACTO","PP_CLI_RUC","PP_CLI_DIR",
        "PP_CLAVE_PED","PP_NRO_PEDIDO","PP_LOGIN","PP_FEC_GRAB",
        "PP_FEC_ENT","PP_FEC_ENTREG_REQ","PP_OBS","PP_ESTADO","PP_DISENHO")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
      [
        clave, 1, 1, nro, hoy,
        pedido.ped_cli, pedido.cli_nom || pedido.ped_cli_nom,
        pedido.ped_tel, pedido.ped_contacto, pedido.ped_ruc || pedido.cli_ruc,
        pedido.ped_cli_dir,
        pedidoClave, pedido.ped_nro, login, hoy,
        pedido.ped_fec_entreg_req || pedido.ped_fec_entreg_prd,
        pedido.ped_fec_entreg_req, pedido.ped_obs,
        'P', 'N',
      ]
    );

    // Copiar items del pedido
    const items = pedido.items || [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      await client.query(
        `INSERT INTO prd_pedido_produccion_det
         ("PPDET_CLAVE_DET","PPDET_ITEM","PPDET_ART","PPDET_CANT","PPDET_UM",
          "PPDET_DESC_LARGA","PPDET_DESCRIPCION",
          "PPDET_MED_LARGO","PPDET_MED_ANCHO","PPDET_MED_ALTO")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clave, i + 1, it.pdet_art, it.pdet_cant_ped, it.pdet_um_ped,
          it.pdet_desc_larga, it.art_desc,
          it.pdet_med_base || null, it.pdet_med_alto || null, it.pdet_med_total || null,
        ]
      );
    }

    await client.query('COMMIT');
    return getById(clave);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, crearDesdePedido };
