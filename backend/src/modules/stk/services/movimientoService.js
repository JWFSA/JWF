const pool = require('../../../config/db');

// ─── MOVIMIENTOS DE STOCK ─────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (d."DOCU_OBS" ILIKE $1 OR CAST(d."DOCU_NRO_DOC" AS TEXT) ILIKE $1 OR o."OPER_DESC" ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM stk_documento d
     LEFT JOIN stk_operacion o ON o."OPER_CODIGO" = d."DOCU_TIPO_MOV"
     ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    clave:  'd."DOCU_CLAVE"',
    nro:    'd."DOCU_NRO_DOC"',
    fecha:  'd."DOCU_FEC_EMIS"',
    oper:   'o."OPER_DESC"',
    dep:    'dep."DEP_DESC"',
  };
  const dir     = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'd."DOCU_CLAVE" DESC';
  const select  = `
    SELECT d."DOCU_CLAVE" AS docu_clave, d."DOCU_NRO_DOC" AS docu_nro_doc,
           d."DOCU_FEC_EMIS" AS docu_fec_emis, d."DOCU_FEC_GRAB" AS docu_fec_grab,
           d."DOCU_TIPO_MOV" AS docu_tipo_mov, o."OPER_DESC" AS oper_desc,
           o."OPER_ENT_SAL" AS oper_ent_sal,
           d."DOCU_DEP_ORIG" AS docu_dep_orig, dep."DEP_DESC" AS dep_orig_desc,
           d."DOCU_DEP_DEST" AS docu_dep_dest, depd."DEP_DESC" AS dep_dest_desc,
           d."DOCU_OBS" AS docu_obs
    FROM stk_documento d
    LEFT JOIN stk_operacion o    ON o."OPER_CODIGO" = d."DOCU_TIPO_MOV"
    LEFT JOIN stk_deposito dep   ON dep."DEP_EMPR" = d."DOCU_EMPR" AND dep."DEP_SUC" = 1 AND dep."DEP_CODIGO" = d."DOCU_DEP_ORIG"
    LEFT JOIN stk_deposito depd  ON depd."DEP_EMPR" = d."DOCU_EMPR" AND depd."DEP_SUC" = 1 AND depd."DEP_CODIGO" = d."DOCU_DEP_DEST"
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

const getById = async (clave) => {
  const { rows } = await pool.query(
    `SELECT d."DOCU_CLAVE" AS docu_clave, d."DOCU_EMPR" AS docu_empr,
            d."DOCU_NRO_DOC" AS docu_nro_doc, d."DOCU_FEC_EMIS" AS docu_fec_emis,
            d."DOCU_FEC_GRAB" AS docu_fec_grab,
            d."DOCU_TIPO_MOV" AS docu_tipo_mov, o."OPER_DESC" AS oper_desc,
            o."OPER_ENT_SAL" AS oper_ent_sal,
            d."DOCU_DEP_ORIG" AS docu_dep_orig, dep."DEP_DESC" AS dep_orig_desc,
            d."DOCU_DEP_DEST" AS docu_dep_dest, depd."DEP_DESC" AS dep_dest_desc,
            d."DOCU_OBS" AS docu_obs
     FROM stk_documento d
     LEFT JOIN stk_operacion o    ON o."OPER_CODIGO" = d."DOCU_TIPO_MOV"
     LEFT JOIN stk_deposito dep   ON dep."DEP_EMPR" = d."DOCU_EMPR" AND dep."DEP_SUC" = 1 AND dep."DEP_CODIGO" = d."DOCU_DEP_ORIG"
     LEFT JOIN stk_deposito depd  ON depd."DEP_EMPR" = d."DOCU_EMPR" AND depd."DEP_SUC" = 1 AND depd."DEP_CODIGO" = d."DOCU_DEP_DEST"
     WHERE d."DOCU_CLAVE" = $1`,
    [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Movimiento no encontrado' };
  const mov = rows[0];

  const { rows: items } = await pool.query(
    `SELECT dt."DETA_CLAVE_DOC" AS deta_clave_doc, dt."DETA_NRO_ITEM" AS deta_nro_item,
            dt."DETA_ART" AS deta_art, a."ART_DESC" AS art_desc,
            a."ART_UNID_MED" AS art_unid_med, dt."DETA_CANT" AS deta_cant
     FROM stk_documento_det dt
     LEFT JOIN stk_articulo a ON a."ART_CODIGO" = dt."DETA_ART"
     WHERE dt."DETA_CLAVE_DOC" = $1
     ORDER BY dt."DETA_NRO_ITEM"`,
    [clave]
  );
  mov.items = items;
  return mov;
};

const insertItems = async (client, clave, items = []) => {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    await client.query(
      `INSERT INTO stk_documento_det
       ("DETA_CLAVE_DOC","DETA_NRO_ITEM","DETA_ART","DETA_EMPR","DETA_CANT",
        "DETA_IMP_NETO_LOC","DETA_IMP_NETO_MON","DETA_IMP_BRUTO_LOC","DETA_IMP_BRUTO_MON",
        "DETA_IVA_LOC","DETA_IVA_MON","DETA_PORC_DTO","DETA_UM_OP","DETA_UM_AR",
        "DETA_TIPO_F","DETA_FACTOR_CV","DETA_CANT_UM_OP")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        clave, i + 1, it.deta_art, 1,
        it.deta_cant || 0,
        0, 0, 0, 0, 0, 0, 0,
        it.art_unid_med || 'U', it.art_unid_med || 'U',
        'N', 1, it.deta_cant || 0,
      ]
    );
  }
};

const create = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: claveRows } = await client.query('SELECT COALESCE(MAX("DOCU_CLAVE"), 0) + 1 AS next FROM stk_documento');
    const clave = claveRows[0].next;
    const { rows: nroRows } = await client.query(
      `SELECT COALESCE(MAX("DOCU_NRO_DOC"), 0) + 1 AS next FROM stk_documento WHERE "DOCU_EMPR" = 1 AND "DOCU_TIPO_MOV" = $1`,
      [data.docu_tipo_mov || null]
    );
    const nro = nroRows[0].next;

    await client.query(
      `INSERT INTO stk_documento
       ("DOCU_CLAVE","DOCU_EMPR","DOCU_NRO_DOC","DOCU_SUC_ORIG","DOCU_DEP_ORIG",
        "DOCU_SUC_DEST","DOCU_DEP_DEST","DOCU_FEC_EMIS","DOCU_TIPO_MOV",
        "DOCU_OBS","DOCU_FEC_GRAB","DOCU_PROCESADO")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        clave, 1, nro, 1,
        data.docu_dep_orig || null,
        1, data.docu_dep_dest || null,
        data.docu_fec_emis || new Date().toISOString().split('T')[0],
        data.docu_tipo_mov || null,
        data.docu_obs || null,
        new Date().toISOString().split('T')[0],
        'N',
      ]
    );
    await insertItems(client, clave, data.items || []);
    await client.query('COMMIT');
    return getById(clave);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const update = async (clave, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const fields = []; const params = [];
    const map = {
      docu_dep_orig:  '"DOCU_DEP_ORIG"',
      docu_dep_dest:  '"DOCU_DEP_DEST"',
      docu_fec_emis:  '"DOCU_FEC_EMIS"',
      docu_tipo_mov:  '"DOCU_TIPO_MOV"',
      docu_obs:       '"DOCU_OBS"',
    };
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
    }
    if (fields.length) {
      params.push(clave);
      await client.query(
        `UPDATE stk_documento SET ${fields.join(', ')} WHERE "DOCU_CLAVE" = $${params.length}`,
        params
      );
    }
    if (data.items !== undefined) {
      await client.query('DELETE FROM stk_documento_det WHERE "DETA_CLAVE_DOC" = $1', [clave]);
      await insertItems(client, clave, data.items);
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

const remove = async (clave) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM stk_documento_det WHERE "DETA_CLAVE_DOC" = $1', [clave]);
    await client.query('DELETE FROM stk_documento WHERE "DOCU_CLAVE" = $1', [clave]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, create, update, remove };
