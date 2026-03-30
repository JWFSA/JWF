const pool = require('../../../config/db');

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (c."CLI_NOM" ILIKE $1 OR CAST(p."PED_NRO" AS TEXT) ILIKE $1 OR p."PED_PRODUCTO" ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM fac_pedido p LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = p."PED_CLI" ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    clave: 'p."PED_CLAVE"', nro: 'p."PED_NRO"', fecha: 'p."PED_FECHA"',
    cliente: 'c."CLI_NOM"', estado: 'p."PED_ESTADO"', total: 'p."PED_IMP_TOTAL_MON"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'p."PED_CLAVE" DESC';
  const select = `
    SELECT p."PED_CLAVE" AS ped_clave, p."PED_NRO" AS ped_nro, p."PED_FECHA" AS ped_fecha,
           p."PED_ESTADO" AS ped_estado, p."PED_IMP_TOTAL_MON" AS ped_imp_total_mon,
           p."PED_COND_VENTA" AS ped_cond_venta, p."PED_MON" AS ped_mon,
           p."PED_CLI" AS ped_cli, c."CLI_NOM" AS cli_nom,
           p."PED_VENDEDOR" AS ped_vendedor,
           o."OPER_NOMBRE" AS vend_nombre, o."OPER_APELLIDO" AS vend_apellido,
           p."PED_PRODUCTO" AS ped_producto
    FROM fac_pedido p
    LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = p."PED_CLI"
    LEFT JOIN fac_vendedor v ON v."VEND_LEGAJO" = p."PED_VENDEDOR"
    LEFT JOIN gen_operador o ON o."OPER_CODIGO" = v."VEND_OPER"
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

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT p."PED_CLAVE" AS ped_clave, p."PED_NRO" AS ped_nro, p."PED_FECHA" AS ped_fecha,
     p."PED_EMPR" AS ped_empr, p."PED_SUC" AS ped_suc,
     p."PED_TIPO" AS ped_tipo, p."PED_ESTADO" AS ped_estado,
     p."PED_MON" AS ped_mon, m."MON_DESC" AS mon_desc,
     p."PED_CLI" AS ped_cli, c."CLI_NOM" AS cli_nom, c."CLI_RUC" AS cli_ruc,
     p."PED_VENDEDOR" AS ped_vendedor,
     o."OPER_NOMBRE" AS vend_nombre, o."OPER_APELLIDO" AS vend_apellido,
     p."PED_COND_VENTA" AS ped_cond_venta,
     p."PED_PRODUCTO" AS ped_producto, p."PED_CONCEPTO" AS ped_concepto,
     p."PED_OBS" AS ped_obs, p."PED_IMP_TOTAL_MON" AS ped_imp_total_mon,
     p."PED_IMP_DCTO_MON" AS ped_imp_dcto_mon,
     p."PED_LOGIN" AS ped_login, p."PED_FEC_GRAB" AS ped_fec_grab
     FROM fac_pedido p
     LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = p."PED_CLI"
     LEFT JOIN gen_moneda m ON m."MON_CODIGO" = p."PED_MON"
     LEFT JOIN fac_vendedor v ON v."VEND_LEGAJO" = p."PED_VENDEDOR"
     LEFT JOIN gen_operador o ON o."OPER_CODIGO" = v."VEND_OPER"
     WHERE p."PED_CLAVE" = $1`,
    [id]
  );
  if (!rows.length) throw { status: 404, message: 'Pedido no encontrado' };
  const pedido = rows[0];

  const { rows: items } = await pool.query(
    `SELECT d."PDET_CLAVE_PED" AS pdet_clave_ped, d."PDET_NRO_ITEM" AS pdet_nro_item,
     d."PDET_ART" AS pdet_art, a."ART_DESC" AS art_desc, a."ART_UNID_MED" AS art_unid_med,
     d."PDET_UM_PED" AS pdet_um_ped, d."PDET_CANT_PED" AS pdet_cant_ped,
     d."PDET_PRECIO" AS pdet_precio, d."PDET_PORC_DCTO" AS pdet_porc_dcto,
     d."PDET_IMP_NETO_DET" AS pdet_imp_neto_det, d."PDET_DESC_LARGA" AS pdet_desc_larga
     FROM fac_pedido_det d
     LEFT JOIN stk_articulo a ON a."ART_CODIGO" = d."PDET_ART"
     WHERE d."PDET_CLAVE_PED" = $1
     ORDER BY d."PDET_NRO_ITEM"`,
    [id]
  );
  pedido.items = items;
  return pedido;
};

const calcTotal = (items = []) =>
  items.reduce((sum, it) => {
    const neto = parseFloat(it.pdet_cant_ped || 0) * parseFloat(it.pdet_precio || 0) * (1 - parseFloat(it.pdet_porc_dcto || 0) / 100);
    return sum + neto;
  }, 0);

const insertItems = async (client, clave, items = []) => {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const neto = parseFloat(it.pdet_cant_ped || 0) * parseFloat(it.pdet_precio || 0) * (1 - parseFloat(it.pdet_porc_dcto || 0) / 100);
    await client.query(
      `INSERT INTO fac_pedido_det
       ("PDET_CLAVE_PED","PDET_NRO_ITEM","PDET_ART","PDET_UM_PED","PDET_UM_ART",
        "PDET_TIPO_F","PDET_FACTOR","PDET_CANT_PED","PDET_PRECIO","PDET_PORC_DCTO",
        "PDET_IMP_NETO_DET","PDET_CANT_UM_ART","PDET_PRECIO_UM_ART","PDET_IMP_NETO_FINAL","PDET_DESC_LARGA")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        clave, i + 1, it.pdet_art,
        it.pdet_um_ped || 'U', it.pdet_um_ped || 'U',
        'N', 1,
        it.pdet_cant_ped, it.pdet_precio || 0, it.pdet_porc_dcto || 0,
        neto, it.pdet_cant_ped, it.pdet_precio || 0, neto,
        it.pdet_desc_larga || null,
      ]
    );
  }
};

const create = async (data, login = 'SISTEMA') => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: codeRows } = await client.query('SELECT COALESCE(MAX("PED_CLAVE"), 0) + 1 AS next FROM fac_pedido');
    const clave = codeRows[0].next;
    const { rows: nroRows } = await client.query(
      `SELECT COALESCE(MAX("PED_NRO"), 0) + 1 AS next FROM fac_pedido WHERE "PED_EMPR" = 1 AND "PED_SUC" = 1`
    );
    const nro = nroRows[0].next;
    const total = calcTotal(data.items);

    await client.query(
      `INSERT INTO fac_pedido
       ("PED_CLAVE","PED_EMPR","PED_SUC","PED_NRO","PED_TIPO","PED_IND_PRD",
        "PED_ESTADO","PED_FECHA","PED_MON","PED_CLI","PED_VENDEDOR","PED_COND_VENTA",
        "PED_PRODUCTO","PED_CONCEPTO","PED_OBS","PED_IMP_TOTAL_MON","PED_IMP_DCTO_MON",
        "PED_IND_REQ_REM","PED_IND_GAR_FUN","PED_IMP_FACTURADO","PED_IMP_DCTO_APLIC",
        "PED_IND_FAC","PED_FEC_GRAB","PED_LOGIN","PED_TASA_US")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
      [
        clave, 1, 1, nro, 'V', 'N',
        data.ped_estado || 'P', data.ped_fecha, data.ped_mon || 1,
        data.ped_cli || null, data.ped_vendedor || null, data.ped_cond_venta || null,
        data.ped_producto || null, data.ped_concepto || null, data.ped_obs || null,
        total, 0, 'N', 'N', 0, 0,
        'P', new Date().toISOString().split('T')[0], login, 0,
      ]
    );
    await insertItems(client, clave, data.items);
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const fields = []; const params = [];
    const map = {
      ped_fecha: '"PED_FECHA"', ped_cli: '"PED_CLI"', ped_vendedor: '"PED_VENDEDOR"',
      ped_cond_venta: '"PED_COND_VENTA"', ped_mon: '"PED_MON"',
      ped_producto: '"PED_PRODUCTO"', ped_concepto: '"PED_CONCEPTO"',
      ped_obs: '"PED_OBS"', ped_estado: '"PED_ESTADO"',
    };
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
    }
    if (data.items !== undefined) {
      params.push(calcTotal(data.items));
      fields.push(`"PED_IMP_TOTAL_MON" = $${params.length}`);
    }
    if (fields.length) {
      params.push(id);
      await client.query(
        `UPDATE fac_pedido SET ${fields.join(', ')} WHERE "PED_CLAVE" = $${params.length}`,
        params
      );
    }
    if (data.items !== undefined) {
      await client.query('DELETE FROM fac_pedido_det WHERE "PDET_CLAVE_PED" = $1', [id]);
      await insertItems(client, id, data.items);
    }
    await client.query('COMMIT');
    return getById(id);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM fac_pedido_det WHERE "PDET_CLAVE_PED" = $1', [id]);
    await client.query('DELETE FROM fac_pedido WHERE "PED_CLAVE" = $1', [id]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

// ─── ARTÍCULOS (búsqueda para items de pedido) ───────────────────────────────

const getArticulos = async ({ page = 1, limit = 20, search = '', all = false } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE ("ART_DESC" ILIKE $1 OR "ART_CODIGO_FABRICA" ILIKE $1)`
    : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM stk_articulo ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const select = `
    SELECT "ART_CODIGO" AS art_codigo, "ART_DESC" AS art_desc,
           "ART_UNID_MED" AS art_unid_med, "ART_CODIGO_FABRICA" AS art_codigo_fabrica
    FROM stk_articulo ${where} ORDER BY "ART_DESC"`;
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

module.exports = { getAll, getById, create, update, remove, getArticulos };
