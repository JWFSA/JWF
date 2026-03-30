const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (r."REM_OBS" ILIKE $1 OR r."REM_CLI_NOM" ILIKE $1 OR c."CLI_NOM" ILIKE $1 OR CAST(r."REM_NRO" AS TEXT) ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM stk_remision r LEFT JOIN fin_cliente c ON c."CLI_CODIGO" = r."REM_CLI" ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nro:    'r."REM_NRO"',
    fecha:  'r."REM_FEC_EMIS"',
    cliente:'c."CLI_NOM"',
    dep:    'd."DEP_DESC"',
  };
  const dir     = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'r."REM_NRO" DESC';
  const select  = `
    SELECT r."REM_NRO" AS rem_nro, r."REM_EMPR" AS rem_empr,
           r."REM_FEC_EMIS" AS rem_fec_emis,
           r."REM_CLI" AS rem_cli, COALESCE(r."REM_CLI_NOM", c."CLI_NOM") AS cli_nom,
           r."REM_DEP" AS rem_dep, d."DEP_DESC" AS dep_desc,
           r."REM_DEP_DEST" AS rem_dep_dest, dd."DEP_DESC" AS dep_dest_desc,
           r."REM_OBS" AS rem_obs, r."REM_NRO_TIMBRADO" AS rem_nro_timbrado
    FROM stk_remision r
    LEFT JOIN fin_cliente c   ON c."CLI_CODIGO" = r."REM_CLI"
    LEFT JOIN stk_deposito d  ON d."DEP_EMPR" = r."REM_EMPR" AND d."DEP_CODIGO" = r."REM_DEP"
    LEFT JOIN stk_deposito dd ON dd."DEP_EMPR" = r."REM_EMPR" AND dd."DEP_CODIGO" = r."REM_DEP_DEST"
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

const getById = async (nro) => {
  const { rows } = await pool.query(
    `SELECT r."REM_NRO" AS rem_nro, r."REM_EMPR" AS rem_empr,
            r."REM_FEC_EMIS" AS rem_fec_emis,
            r."REM_CLI" AS rem_cli, COALESCE(r."REM_CLI_NOM", c."CLI_NOM") AS cli_nom,
            c."CLI_NOM" AS cli_nom_db,
            r."REM_CLI_NOM" AS rem_cli_nom,
            r."REM_DEP" AS rem_dep, d."DEP_DESC" AS dep_desc,
            r."REM_DEP_DEST" AS rem_dep_dest, dd."DEP_DESC" AS dep_dest_desc,
            r."REM_OBS" AS rem_obs, r."REM_NRO_TIMBRADO" AS rem_nro_timbrado,
            r."REM_FEC_GRAB" AS rem_fec_grab
     FROM stk_remision r
     LEFT JOIN fin_cliente c   ON c."CLI_CODIGO" = r."REM_CLI"
     LEFT JOIN stk_deposito d  ON d."DEP_EMPR" = r."REM_EMPR" AND d."DEP_CODIGO" = r."REM_DEP"
     LEFT JOIN stk_deposito dd ON dd."DEP_EMPR" = r."REM_EMPR" AND dd."DEP_CODIGO" = r."REM_DEP_DEST"
     WHERE r."REM_NRO" = $1 AND r."REM_EMPR" = 1`,
    [nro]
  );
  if (!rows.length) throw { status: 404, message: 'Remisión no encontrada' };
  const rem = rows[0];

  const { rows: items } = await pool.query(
    `SELECT rd."DETR_NRO_ITEM" AS detr_nro_item,
            rd."DETR_ART" AS detr_art, a."ART_DESC" AS art_desc,
            a."ART_UNID_MED" AS art_unid_med, rd."DETR_CANT_REM" AS detr_cant_rem
     FROM stk_remision_det rd
     LEFT JOIN stk_articulo a ON a."ART_CODIGO" = rd."DETR_ART"
     WHERE rd."DETR_REM" = $1 AND rd."DETR_EMPR" = 1
     ORDER BY rd."DETR_NRO_ITEM"`,
    [nro]
  );
  rem.items = items;
  return rem;
};

const insertItems = async (client, nro, items = []) => {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    await client.query(
      `INSERT INTO stk_remision_det ("DETR_EMPR","DETR_REM","DETR_NRO_ITEM","DETR_ART","DETR_CANT_REM","DETR_CANT_FACT")
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [1, nro, i + 1, it.detr_art, it.detr_cant_rem || 0, 0]
    );
  }
};

const create = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: nroRows } = await client.query(
      `SELECT COALESCE(MAX("REM_NRO"), 10010000000) + 1 AS next FROM stk_remision WHERE "REM_EMPR" = 1`
    );
    const nro = nroRows[0].next;

    await client.query(
      `INSERT INTO stk_remision
       ("REM_EMPR","REM_NRO","REM_FEC_EMIS","REM_CLI","REM_CLI_NOM",
        "REM_DEP","REM_DEP_ORIG","REM_DEP_DEST","REM_OBS","REM_NRO_TIMBRADO","REM_FEC_GRAB")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        1, nro,
        data.rem_fec_emis || new Date().toISOString().split('T')[0],
        data.rem_cli || null,
        data.rem_cli_nom || null,
        data.rem_dep || null,
        data.rem_dep || null,
        data.rem_dep_dest || null,
        data.rem_obs || null,
        data.rem_nro_timbrado || null,
        new Date().toISOString().split('T')[0],
      ]
    );
    await insertItems(client, nro, data.items || []);
    await client.query('COMMIT');
    return getById(nro);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const update = async (nro, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const fields = []; const params = [];
    const map = {
      rem_fec_emis:     '"REM_FEC_EMIS"',
      rem_cli:          '"REM_CLI"',
      rem_cli_nom:      '"REM_CLI_NOM"',
      rem_dep:          '"REM_DEP"',
      rem_dep_dest:     '"REM_DEP_DEST"',
      rem_obs:          '"REM_OBS"',
      rem_nro_timbrado: '"REM_NRO_TIMBRADO"',
    };
    for (const [k, col] of Object.entries(map)) {
      if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
    }
    if (fields.length) {
      params.push(nro);
      await client.query(
        `UPDATE stk_remision SET ${fields.join(', ')} WHERE "REM_NRO" = $${params.length} AND "REM_EMPR" = 1`,
        params
      );
    }
    if (data.items !== undefined) {
      await client.query('DELETE FROM stk_remision_det WHERE "DETR_REM" = $1 AND "DETR_EMPR" = 1', [nro]);
      await insertItems(client, nro, data.items);
    }
    await client.query('COMMIT');
    return getById(nro);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const remove = async (nro) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM stk_remision_det WHERE "DETR_REM" = $1 AND "DETR_EMPR" = 1', [nro]);
    await client.query('DELETE FROM stk_remision WHERE "REM_NRO" = $1 AND "REM_EMPR" = 1', [nro]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, create, update, remove };
