const pool = require('../../../config/db');

// ─── CONTRATOS DE PROVEEDOR ─────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (CAST(c."CONT_CLAVE" AS TEXT) ILIKE $1 OR p."PROV_RAZON_SOCIAL" ILIKE $1 OR c."CONT_OBS" ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM com_contrato_prov c
     LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = c."CONT_PROV"
     ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    clave:    'c."CONT_CLAVE"',
    fecha:    'c."CONT_FECHA"',
    prov:     'p."PROV_RAZON_SOCIAL"',
    total:    'c."CONT_IMP_TOTAL"',
    vigente:  'c."CONT_IND_VIGENTE"',
  };
  const dir     = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'c."CONT_CLAVE" DESC';
  const select  = `
    SELECT c."CONT_CLAVE"         AS cont_clave,
           c."CONT_NUMERO"        AS cont_numero,
           c."CONT_PROV"          AS cont_prov,
           p."PROV_RAZON_SOCIAL"  AS prov_nom,
           c."CONT_FECHA"         AS cont_fecha,
           c."CONT_MON"           AS cont_mon,
           m."MON_DESC"           AS mon_desc,
           c."CONT_IMP_TOTAL"     AS cont_imp_total,
           c."CONT_IND_INTERNO"   AS cont_ind_interno,
           c."CONT_IND_ANTERIOR"  AS cont_ind_anterior,
           c."CONT_IND_VIGENTE"   AS cont_ind_vigente,
           c."CONT_OBS"           AS cont_obs,
           c."CONT_IMP_FACTU"     AS cont_imp_factu,
           c."CONT_IMP_PEND_F"    AS cont_imp_pend_f
    FROM com_contrato_prov c
    LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = c."CONT_PROV"
    LEFT JOIN gen_moneda    m ON m."MON_CODIGO"  = c."CONT_MON"
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
    `SELECT c."CONT_CLAVE"         AS cont_clave,
            c."CONT_NUMERO"        AS cont_numero,
            c."CONT_PROV"          AS cont_prov,
            p."PROV_RAZON_SOCIAL"  AS prov_nom,
            c."CONT_FECHA"         AS cont_fecha,
            c."CONT_MON"           AS cont_mon,
            m."MON_DESC"           AS mon_desc,
            c."CONT_IMP_TOTAL"     AS cont_imp_total,
            c."CONT_IND_INTERNO"   AS cont_ind_interno,
            c."CONT_IND_ANTERIOR"  AS cont_ind_anterior,
            c."CONT_IND_VIGENTE"   AS cont_ind_vigente,
            c."CONT_OBS"           AS cont_obs,
            c."CONT_IMP_FACTU"     AS cont_imp_factu,
            c."CONT_IMP_PEND_F"    AS cont_imp_pend_f
     FROM com_contrato_prov c
     LEFT JOIN fin_proveedor p ON p."PROV_CODIGO" = c."CONT_PROV"
     LEFT JOIN gen_moneda    m ON m."MON_CODIGO"  = c."CONT_MON"
     WHERE c."CONT_CLAVE" = $1`,
    [clave]
  );
  if (!rows.length) throw { status: 404, message: 'Contrato no encontrado' };

  const { rows: detalle } = await pool.query(
    `SELECT d."COND_CLAVE_CONT" AS cond_clave_cont,
            d."COND_NRO_ITEM"   AS cond_nro_item,
            d."COND_LOCAL"      AS cond_local,
            d."COND_FEC_INI"    AS cond_fec_ini,
            d."COND_FEC_FIN"    AS cond_fec_fin,
            d."COND_UN_MED"     AS cond_un_med,
            d."COND_CANT"       AS cond_cant,
            d."COND_PRECIO"     AS cond_precio,
            d."COND_IMP_TOTAL"  AS cond_imp_total,
            d."COND_IMP_FACTU"  AS cond_imp_factu
     FROM com_contrato_prov_det d
     WHERE d."COND_CLAVE_CONT" = $1
     ORDER BY d."COND_NRO_ITEM"`,
    [clave]
  );

  return { ...rows[0], detalle };
};

const create = async (data) => {
  const { rows: claveRows } = await pool.query('SELECT COALESCE(MAX("CONT_CLAVE"), 0) + 1 AS next FROM com_contrato_prov');
  const clave = claveRows[0].next;
  const { rows: numRows } = await pool.query('SELECT COALESCE(MAX("CONT_NUMERO"), 0) + 1 AS next FROM com_contrato_prov');
  const numero = numRows[0].next;

  await pool.query(
    `INSERT INTO com_contrato_prov
     ("CONT_CLAVE","CONT_NUMERO","CONT_PROV","CONT_FECHA","CONT_MON",
      "CONT_IMP_TOTAL","CONT_IND_INTERNO","CONT_IND_ANTERIOR",
      "CONT_IND_VIGENTE","CONT_OBS","CONT_IMP_FACTU","CONT_IMP_PEND_F")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      clave,
      numero,
      data.cont_prov          || null,
      data.cont_fecha,
      data.cont_mon           || null,
      data.cont_imp_total     || 0,
      data.cont_ind_interno   || 'N',
      data.cont_ind_anterior  || 'N',
      data.cont_ind_vigente   || 'S',
      data.cont_obs           || null,
      0,
      data.cont_imp_total     || 0,
    ]
  );

  if (data.detalle && Array.isArray(data.detalle)) {
    for (let i = 0; i < data.detalle.length; i++) {
      const d = data.detalle[i];
      await pool.query(
        `INSERT INTO com_contrato_prov_det
         ("COND_CLAVE_CONT","COND_NRO_ITEM","COND_LOCAL","COND_FEC_INI",
          "COND_FEC_FIN","COND_UN_MED","COND_CANT","COND_PRECIO",
          "COND_IMP_TOTAL","COND_IMP_FACTU")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clave,
          i + 1,
          d.cond_local    || null,
          d.cond_fec_ini  || null,
          d.cond_fec_fin  || null,
          d.cond_un_med   || null,
          d.cond_cant     || 0,
          d.cond_precio   || 0,
          d.cond_imp_total|| 0,
          0,
        ]
      );
    }
  }

  return getById(clave);
};

const update = async (clave, data) => {
  const fields = []; const params = [];
  const map = {
    cont_prov:          '"CONT_PROV"',
    cont_fecha:         '"CONT_FECHA"',
    cont_mon:           '"CONT_MON"',
    cont_imp_total:     '"CONT_IMP_TOTAL"',
    cont_ind_interno:   '"CONT_IND_INTERNO"',
    cont_ind_anterior:  '"CONT_IND_ANTERIOR"',
    cont_ind_vigente:   '"CONT_IND_VIGENTE"',
    cont_obs:           '"CONT_OBS"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (fields.length) {
    params.push(clave);
    await pool.query(
      `UPDATE com_contrato_prov SET ${fields.join(', ')} WHERE "CONT_CLAVE" = $${params.length}`,
      params
    );
  }

  if (data.detalle && Array.isArray(data.detalle)) {
    await pool.query('DELETE FROM com_contrato_prov_det WHERE "COND_CLAVE_CONT" = $1', [clave]);
    for (let i = 0; i < data.detalle.length; i++) {
      const d = data.detalle[i];
      await pool.query(
        `INSERT INTO com_contrato_prov_det
         ("COND_CLAVE_CONT","COND_NRO_ITEM","COND_LOCAL","COND_FEC_INI",
          "COND_FEC_FIN","COND_UN_MED","COND_CANT","COND_PRECIO",
          "COND_IMP_TOTAL","COND_IMP_FACTU")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          clave,
          i + 1,
          d.cond_local    || null,
          d.cond_fec_ini  || null,
          d.cond_fec_fin  || null,
          d.cond_un_med   || null,
          d.cond_cant     || 0,
          d.cond_precio   || 0,
          d.cond_imp_total|| 0,
          0,
        ]
      );
    }
  }

  return getById(clave);
};

const remove = async (clave) => {
  await pool.query('DELETE FROM com_contrato_prov_cuo WHERE "CONC_CLAVE_CONT" = $1', [clave]);
  await pool.query('DELETE FROM com_contrato_prov_det WHERE "COND_CLAVE_CONT" = $1', [clave]);
  await pool.query('DELETE FROM com_contrato_prov WHERE "CONT_CLAVE" = $1', [clave]);
};

module.exports = { getAll, getById, create, update, remove };
