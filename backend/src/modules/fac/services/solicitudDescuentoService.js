const pool = require('../../../config/db');

// ─── SOLICITUDES DE DESCUENTO ───────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (CAST(s."SOD_NRO" AS TEXT) ILIKE $1 OR s."SOD_LOGIN_SOL" ILIKE $1)`
    : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fac_solicitud_descuento s ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nro:   's."SOD_NRO"',
    fecha: 's."SOD_FECHA_SOL"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 's."SOD_CLAVE" DESC';
  const select = `
    SELECT s."SOD_CLAVE"     AS sod_clave,
           s."SOD_NRO"       AS sod_nro,
           s."SOD_CLAVE_PED" AS sod_clave_ped,
           s."SOD_FECHA_SOL" AS sod_fecha_sol,
           s."SOD_LOGIN_SOL" AS sod_login_sol,
           (SELECT COUNT(*) FROM fac_solicitud_descuento_det d WHERE d."SODE_CLAVE" = s."SOD_CLAVE") AS cant_items
    FROM fac_solicitud_descuento s
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
    `SELECT s."SOD_CLAVE"     AS sod_clave,
            s."SOD_NRO"       AS sod_nro,
            s."SOD_CLAVE_PED" AS sod_clave_ped,
            s."SOD_FECHA_SOL" AS sod_fecha_sol,
            s."SOD_FEC_GRAB"  AS sod_fec_grab,
            s."SOD_LOGIN_SOL" AS sod_login_sol
     FROM fac_solicitud_descuento s
     WHERE s."SOD_CLAVE" = $1`,
    [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Solicitud no encontrada' };

  const { rows: detalle } = await pool.query(
    `SELECT d."SODE_CLAVE"           AS sode_clave,
            d."SODE_ITEM"            AS sode_item,
            d."SODE_ART"             AS sode_art,
            a."ART_DESC"             AS art_desc,
            d."SODE_DCTO_SOL"        AS sode_dcto_sol,
            d."SODE_DCTO_APROB"      AS sode_dcto_aprob,
            d."SODE_ESTADO"          AS sode_estado,
            d."SODE_FEC_EST"         AS sode_fec_est,
            d."SODE_USER_EST"        AS sode_user_est,
            d."SODE_IMP_SOL"         AS sode_imp_sol,
            d."SODE_IMP_APROB"       AS sode_imp_aprob,
            d."SODE_IMP_NETO_ANT"    AS sode_imp_neto_ant,
            d."SODE_IMP_NETO_FINAL"  AS sode_imp_neto_final
     FROM fac_solicitud_descuento_det d
     LEFT JOIN stk_articulo a ON a."ART_CODIGO" = d."SODE_ART"
     WHERE d."SODE_CLAVE" = $1
     ORDER BY d."SODE_ITEM"`,
    [clave]
  );

  return { ...rows[0], detalle };
};

// ─── CREAR solicitud desde pedido ───────────────────────────────────────────

const create = async (data, login = 'SISTEMA') => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [{ next: clave }] } = await client.query('SELECT COALESCE(MAX("SOD_CLAVE"), 0) + 1 AS next FROM fac_solicitud_descuento');
    const { rows: [{ next: nro }] } = await client.query('SELECT COALESCE(MAX("SOD_NRO"), 0) + 1 AS next FROM fac_solicitud_descuento');
    const hoy = new Date().toISOString().split('T')[0];

    await client.query(
      `INSERT INTO fac_solicitud_descuento ("SOD_CLAVE","SOD_NRO","SOD_CLAVE_PED","SOD_FECHA_SOL","SOD_FEC_GRAB","SOD_LOGIN_SOL")
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [clave, nro, data.sod_clave_ped, data.sod_fecha_sol || hoy, hoy, login]
    );

    for (let i = 0; i < (data.detalle || []).length; i++) {
      const d = data.detalle[i];
      const netoAnt = Number(d.sode_imp_neto_ant || 0);
      const impSol = netoAnt * (Number(d.sode_dcto_sol || 0) / 100);
      await client.query(
        `INSERT INTO fac_solicitud_descuento_det
         ("SODE_CLAVE","SODE_ITEM","SODE_ART","SODE_ITEM_PED","SODE_CLAVE_PED",
          "SODE_DCTO_SOL","SODE_DCTO_APROB","SODE_ESTADO",
          "SODE_IMP_SOL","SODE_IMP_APROB","SODE_IMP_NETO_ANT","SODE_IMP_NETO_FINAL")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          clave, i + 1, d.sode_art, d.sode_item_ped, data.sod_clave_ped,
          d.sode_dcto_sol || 0, null, 'P',
          impSol, null, netoAnt, netoAnt,
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

// ─── APROBAR / RECHAZAR items ───────────────────────────────────────────────

const procesarItem = async (clave, item, accion, data, login = 'SISTEMA') => {
  const estado = accion === 'aprobar' ? 'A' : 'R';
  const hoy = new Date().toISOString().split('T')[0];

  if (accion === 'aprobar') {
    // Calcular neto final con dcto aprobado
    const { rows } = await pool.query(
      `SELECT "SODE_IMP_NETO_ANT", "SODE_DCTO_SOL" FROM fac_solicitud_descuento_det WHERE "SODE_CLAVE" = $1 AND "SODE_ITEM" = $2`,
      [clave, item]
    );
    if (!rows.length) throw { status: 404, message: 'Item no encontrado' };
    const netoAnt = Number(rows[0].SODE_IMP_NETO_ANT || 0);
    const dctoAprob = data.sode_dcto_aprob ?? Number(rows[0].SODE_DCTO_SOL);
    const impAprob = netoAnt * (dctoAprob / 100);
    const netoFinal = netoAnt - impAprob;

    await pool.query(
      `UPDATE fac_solicitud_descuento_det
       SET "SODE_ESTADO" = $1, "SODE_FEC_EST" = $2, "SODE_USER_EST" = $3,
           "SODE_DCTO_APROB" = $4, "SODE_IMP_APROB" = $5, "SODE_IMP_NETO_FINAL" = $6
       WHERE "SODE_CLAVE" = $7 AND "SODE_ITEM" = $8`,
      [estado, hoy, login, dctoAprob, impAprob, netoFinal, clave, item]
    );

    // Actualizar descuento en el pedido_det correspondiente
    const { rows: detRows } = await pool.query(
      `SELECT "SODE_CLAVE_PED", "SODE_ITEM_PED" FROM fac_solicitud_descuento_det WHERE "SODE_CLAVE" = $1 AND "SODE_ITEM" = $2`,
      [clave, item]
    );
    if (detRows.length && detRows[0].SODE_CLAVE_PED && detRows[0].SODE_ITEM_PED) {
      await pool.query(
        `UPDATE fac_pedido_det SET "PDET_PORC_DCTO" = $1, "PDET_IND_DTO_AUTORIZADO" = 'S', "PDET_DTO_LOGIN" = $2
         WHERE "PDET_CLAVE_PED" = $3 AND "PDET_NRO_ITEM" = $4`,
        [dctoAprob, login, detRows[0].SODE_CLAVE_PED, detRows[0].SODE_ITEM_PED]
      );
    }
  } else {
    await pool.query(
      `UPDATE fac_solicitud_descuento_det
       SET "SODE_ESTADO" = $1, "SODE_FEC_EST" = $2, "SODE_USER_EST" = $3,
           "SODE_DCTO_APROB" = 0, "SODE_IMP_APROB" = 0
       WHERE "SODE_CLAVE" = $4 AND "SODE_ITEM" = $5`,
      [estado, hoy, login, clave, item]
    );
  }

  return getById(clave);
};

// ─── APROBAR/RECHAZAR TODOS ─────────────────────────────────────────────────

const procesarTodos = async (clave, accion, login = 'SISTEMA') => {
  const sol = await getById(clave);
  for (const d of (sol.detalle || [])) {
    if (d.sode_estado === 'P') {
      await procesarItem(clave, d.sode_item, accion, { sode_dcto_aprob: d.sode_dcto_sol }, login);
    }
  }
  return getById(clave);
};

module.exports = { getAll, getById, create, procesarItem, procesarTodos };
