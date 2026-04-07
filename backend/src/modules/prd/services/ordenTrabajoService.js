const pool = require('../../../config/db');

// ─── ORDEN DE TRABAJO ───────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc', tipo = '', situacion = '', fechaDesde = '', fechaHasta = '' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  const conditions = [];
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(ot."OT_CLI_NOM" ILIKE $${params.length} OR CAST(ot."OT_NRO" AS TEXT) ILIKE $${params.length} OR ot."OT_DESC" ILIKE $${params.length} OR ot."OT_NOM_PRODUCTO" ILIKE $${params.length})`);
  }
  if (tipo)       { params.push(tipo);       conditions.push(`ot."OT_TIPO" = $${params.length}`); }
  if (situacion)  { params.push(situacion);  conditions.push(`ot."OT_SITUACION" = $${params.length}`); }
  if (fechaDesde) { params.push(fechaDesde); conditions.push(`ot."OT_FEC_EMIS" >= $${params.length}`); }
  if (fechaHasta) { params.push(fechaHasta); conditions.push(`ot."OT_FEC_EMIS" <= $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM prd_orden_trabajo ot ${where}`, params);
  const total = parseInt(countRes.rows[0].count);

  const allowedSort = {
    nro: 'ot."OT_NRO"', fecha: 'ot."OT_FEC_EMIS"', cliente: 'ot."OT_CLI_NOM"',
    situacion: 'ot."OT_SITUACION"', tipo: 'ot."OT_TIPO"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'ot."OT_CLAVE" DESC';

  const select = `
    SELECT ot."OT_CLAVE" AS ot_clave, ot."OT_NRO" AS ot_nro, ot."OT_DESC" AS ot_desc,
           ot."OT_FEC_EMIS" AS ot_fec_emis, ot."OT_FEC_ENT" AS ot_fec_ent,
           ot."OT_FEC_PREV_TERM" AS ot_fec_prev_term,
           ot."OT_TIPO" AS ot_tipo, t."TIPO_DESC" AS tipo_desc,
           ot."OT_SITUACION" AS ot_situacion,
           ot."OT_CLI" AS ot_cli, ot."OT_CLI_NOM" AS ot_cli_nom,
           ot."OT_NOM_PRODUCTO" AS ot_nom_producto,
           ot."OT_CLAVE_PED" AS ot_clave_ped, ot."OT_NRO_ITEM_PED" AS ot_nro_item_ped,
           ot."OT_COSTO_MON" AS ot_costo_mon
    FROM prd_orden_trabajo ot
    LEFT JOIN prd_tipo_ot t ON t."TIPO_CODIGO" = ot."OT_TIPO"
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
    `SELECT ot.*, t."TIPO_DESC" AS tipo_desc, c."CLI_NOM" AS cli_nom_full,
            m."MON_DESC" AS mon_desc, p."PED_NRO" AS ped_nro
     FROM prd_orden_trabajo ot
     LEFT JOIN prd_tipo_ot t ON t."TIPO_CODIGO" = ot."OT_TIPO"
     LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = ot."OT_CLI"
     LEFT JOIN gen_moneda m ON m."MON_CODIGO" = ot."OT_MON"
     LEFT JOIN fac_pedido p ON p."PED_CLAVE" = ot."OT_CLAVE_PED"
     WHERE ot."OT_CLAVE" = $1`, [id]
  );
  if (!rows.length) throw { status: 404, message: 'OT no encontrada' };

  // Convertir columnas a lowercase
  const ot = {};
  for (const [k, v] of Object.entries(rows[0])) {
    ot[k.toLowerCase()] = v;
  }

  // Gastos
  const { rows: gastos } = await pool.query(
    `SELECT g."GAST_CLAVE_OT" AS gast_clave_ot, g."GAST_NRO_ITEM" AS gast_nro_item,
            g."GAST_NRO_DOC" AS gast_nro_doc, g."GAST_PROV_NOM" AS gast_prov_nom,
            g."GAST_FEC_EMIS" AS gast_fec_emis, g."GAST_DETALLE" AS gast_detalle,
            g."GAST_NETO_LOC" AS gast_neto_loc, g."GAST_NETO_MON" AS gast_neto_mon,
            g."GAST_IVA_MON" AS gast_iva_mon, g."GAST_IVA_LOC" AS gast_iva_loc,
            g."GAST_PORC_UTILIDAD" AS gast_porc_utilidad,
            g."GAST_IMPORTE_VTA_MON" AS gast_importe_vta_mon,
            g."GAST_IMPORTE_GASTO_MON" AS gast_importe_gasto_mon,
            g."GAST_ARTICULO" AS gast_articulo, a."ART_DESC" AS art_desc,
            g."GAST_CANT_AR" AS gast_cant_ar, g."GAST_UM_AR" AS gast_um_ar,
            g."GAST_LOGIN" AS gast_login, g."GAST_CODIGO_OPER" AS gast_codigo_oper
     FROM prd_gasto_ot g
     LEFT JOIN stk_articulo a ON a."ART_CODIGO" = g."GAST_ARTICULO"
     WHERE g."GAST_CLAVE_OT" = $1
     ORDER BY g."GAST_NRO_ITEM"`, [id]
  );
  ot.gastos = gastos;

  // Eventos
  const { rows: eventos } = await pool.query(
    `SELECT "EOT_CLAVE" AS eot_clave, "EOT_FEC_EVENTO" AS eot_fec_evento,
            "EOT_TIPO_EVENTO" AS eot_tipo_evento, "EOT_USER" AS eot_user,
            "EOT_DESC_EVENTO" AS eot_desc_evento, "EOT_CAMP_AFECTADO" AS eot_camp_afectado,
            "EOT_DATOS_OLD" AS eot_datos_old, "EOT_DATOS_NEW" AS eot_datos_new
     FROM prd_evento_ot WHERE "EOT_CLAVE_OT" = $1
     ORDER BY "EOT_CLAVE" DESC`, [id]
  );
  ot.eventos = eventos;

  return ot;
};

const create = async (data, login = 'SISTEMA') => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [{ next: clave }] } = await client.query('SELECT COALESCE(MAX("OT_CLAVE"), 0) + 1 AS next FROM prd_orden_trabajo');
    const { rows: [{ next: nro }] } = await client.query('SELECT COALESCE(MAX("OT_NRO"), 0) + 1 AS next FROM prd_orden_trabajo WHERE "OT_EMPR" = 1 AND "OT_SUC" = 1');
    const hoy = new Date().toISOString().split('T')[0];

    await client.query(
      `INSERT INTO prd_orden_trabajo
       ("OT_CLAVE","OT_EMPR","OT_SUC","OT_NRO","OT_DESC","OT_FEC_EMIS","OT_MON","OT_TIPO",
        "OT_CLI","OT_CLI_NOM","OT_CLI_TEL","OT_CONTACTO","OT_CLI_CONTACTO",
        "OT_SERVICIO","OT_SITUACION","OT_FEC_ENT","OT_FEC_PREV_TERM","OT_OBS",
        "OT_LEGAJO","OT_NOM_PRODUCTO","OT_CONCEPTO","OT_MARCA","OT_DESC_MARCA",
        "OT_CLAVE_PED","OT_NRO_ITEM_PED","OT_IND_DISENHO",
        "OT_USER","OT_IND_I_E","OT_CANT_P","OT_UM")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)`,
      [
        clave, 1, 1, nro, data.ot_desc || null, data.ot_fec_emis || hoy,
        data.ot_mon || 1, data.ot_tipo || null,
        data.ot_cli || null, data.ot_cli_nom || null, data.ot_cli_tel || null,
        data.ot_contacto || null, data.ot_cli_contacto || null,
        data.ot_servicio || null, data.ot_situacion || 1,
        data.ot_fec_ent || null, data.ot_fec_prev_term || null, data.ot_obs || null,
        data.ot_legajo || null, data.ot_nom_producto || null, data.ot_concepto || null,
        data.ot_marca || null, data.ot_desc_marca || null,
        data.ot_clave_ped || null, data.ot_nro_item_ped || null,
        data.ot_ind_disenho || 'N',
        login, data.ot_ind_i_e || null, data.ot_cant_p || null, data.ot_um || null,
      ]
    );
    await client.query('COMMIT');
    return getById(clave);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const update = async (id, data) => {
  const fields = []; const params = [];
  const map = {
    ot_desc: '"OT_DESC"', ot_fec_emis: '"OT_FEC_EMIS"', ot_mon: '"OT_MON"', ot_tipo: '"OT_TIPO"',
    ot_cli: '"OT_CLI"', ot_cli_nom: '"OT_CLI_NOM"', ot_cli_tel: '"OT_CLI_TEL"',
    ot_contacto: '"OT_CONTACTO"', ot_cli_contacto: '"OT_CLI_CONTACTO"',
    ot_servicio: '"OT_SERVICIO"', ot_situacion: '"OT_SITUACION"',
    ot_fec_ent: '"OT_FEC_ENT"', ot_fec_prev_term: '"OT_FEC_PREV_TERM"',
    ot_fec_liquidacion: '"OT_FEC_LIQUIDACION"', ot_obs: '"OT_OBS"',
    ot_legajo: '"OT_LEGAJO"', ot_nom_producto: '"OT_NOM_PRODUCTO"',
    ot_concepto: '"OT_CONCEPTO"', ot_marca: '"OT_MARCA"', ot_desc_marca: '"OT_DESC_MARCA"',
    ot_clave_ped: '"OT_CLAVE_PED"', ot_nro_item_ped: '"OT_NRO_ITEM_PED"',
    ot_ind_disenho: '"OT_IND_DISENHO"', ot_ruta_disenho: '"OT_RUTA_DISENHO"',
    ot_cant_p: '"OT_CANT_P"', ot_um: '"OT_UM"',
    ot_costo_mon: '"OT_COSTO_MON"', ot_costo_loc: '"OT_COSTO_LOC"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getById(id);
  params.push(id);
  await pool.query(`UPDATE prd_orden_trabajo SET ${fields.join(', ')} WHERE "OT_CLAVE" = $${params.length}`, params);
  return getById(id);
};

const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM prd_evento_ot WHERE "EOT_CLAVE_OT" = $1', [id]);
    await client.query('DELETE FROM prd_gasto_ot WHERE "GAST_CLAVE_OT" = $1', [id]);
    await client.query('DELETE FROM prd_orden_trabajo WHERE "OT_CLAVE" = $1', [id]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

// ─── GASTOS ─────────────────────────────────────────────────────────────────

const addGasto = async (otClave, data, login = 'SISTEMA') => {
  const { rows: [{ next }] } = await pool.query(
    'SELECT COALESCE(MAX("GAST_NRO_ITEM"), 0) + 1 AS next FROM prd_gasto_ot WHERE "GAST_CLAVE_OT" = $1', [otClave]
  );
  const hoy = new Date().toISOString().split('T')[0];
  await pool.query(
    `INSERT INTO prd_gasto_ot
     ("GAST_CLAVE_OT","GAST_NRO_ITEM","GAST_NRO_DOC","GAST_PROV_NOM","GAST_FEC_EMIS",
      "GAST_CODIGO_OPER","GAST_PROV","GAST_MON","GAST_DETALLE",
      "GAST_NETO_LOC","GAST_NETO_MON","GAST_IVA_MON","GAST_IVA_LOC",
      "GAST_PORC_UTILIDAD","GAST_IMPORTE_VTA_MON","GAST_IMPORTE_GASTO_MON",
      "GAST_ARTICULO","GAST_CANT_AR","GAST_UM_AR","GAST_COD_IMPU",
      "GAST_FEC_GRAB","GAST_LOGIN")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
    [
      otClave, next, data.gast_nro_doc || null, data.gast_prov_nom || null,
      data.gast_fec_emis || hoy,
      data.gast_codigo_oper || null, data.gast_prov || null, data.gast_mon || 1,
      data.gast_detalle || null,
      data.gast_neto_loc || 0, data.gast_neto_mon || 0,
      data.gast_iva_mon || 0, data.gast_iva_loc || 0,
      data.gast_porc_utilidad || 0, data.gast_importe_vta_mon || 0,
      data.gast_importe_gasto_mon || 0,
      data.gast_articulo || null, data.gast_cant_ar || null, data.gast_um_ar || null,
      data.gast_cod_impu || null,
      hoy, login,
    ]
  );
  return getById(otClave);
};

const removeGasto = async (otClave, nroItem) => {
  await pool.query('DELETE FROM prd_gasto_ot WHERE "GAST_CLAVE_OT" = $1 AND "GAST_NRO_ITEM" = $2', [otClave, nroItem]);
  return getById(otClave);
};

// ─── TIPOS DE OT (lookup) ──────────────────────────────────────────────────

const getTiposOT = async () => {
  const { rows } = await pool.query('SELECT "TIPO_CODIGO" AS tipo_codigo, "TIPO_DESC" AS tipo_desc FROM prd_tipo_ot ORDER BY "TIPO_CODIGO"');
  return rows;
};

// ─── CREAR OT DESDE PEDIDO ─────────────────────────────────────────────────

const crearDesdePedido = async (pedidoClave, itemPed, login = 'SISTEMA') => {
  const pedidoService = require('../../fac/services/pedidoService');
  const pedido = await pedidoService.getById(pedidoClave);
  const item = (pedido.items || []).find((i) => Number(i.pdet_nro_item) === Number(itemPed));

  return create({
    ot_desc: item ? (item.art_desc || item.pdet_desc_larga) : pedido.ped_producto,
    ot_fec_emis: new Date().toISOString().split('T')[0],
    ot_mon: pedido.ped_mon,
    ot_cli: pedido.ped_cli,
    ot_cli_nom: pedido.cli_nom || pedido.ped_cli_nom,
    ot_cli_tel: pedido.ped_tel,
    ot_contacto: pedido.ped_contacto,
    ot_nom_producto: pedido.ped_producto,
    ot_concepto: pedido.ped_concepto,
    ot_clave_ped: pedidoClave,
    ot_nro_item_ped: itemPed || null,
    ot_cant_p: item ? item.pdet_cant_ped : null,
    ot_um: item ? item.pdet_um_ped : null,
    ot_situacion: 1,
  }, login);
};

module.exports = { getAll, getById, create, update, remove, addGasto, removeGasto, getTiposOT, crearDesdePedido };
