const pool = require('../../../config/db');

// ─── COMISIONES ─────────────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));

  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `AND (c."COM_ART_DESC" ILIKE $1 OR c."COM_CLAS_DESC" ILIKE $1 OR CAST(c."COM_NRO" AS TEXT) ILIKE $1)`
    : '';
  const countRes = await pool.query(
    `SELECT COUNT(*) FROM fac_comisiones c WHERE c."COM_EMPR" = 1 ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    nro:    'c."COM_NRO"',
    fecha:  'c."COM_FEC_EMIS"',
    art:    'c."COM_ART_DESC"',
    clas:   'c."COM_CLAS_DESC"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = Object.hasOwn(allowedSort, sortField) ? `${allowedSort[sortField]} ${dir}` : 'c."COM_CLAVE" DESC';
  const select = `
    SELECT c."COM_CLAVE"            AS com_clave,
           c."COM_NRO"              AS com_nro,
           c."COM_FEC_EMIS"         AS com_fec_emis,
           c."COM_ART"              AS com_art,
           c."COM_ART_DESC"         AS com_art_desc,
           c."COM_ART_ALFA"         AS com_art_alfa,
           c."COM_CLAS"             AS com_clas,
           c."COM_CLAS_DESC"        AS com_clas_desc,
           c."COM_DIFICULTAD"       AS com_dificultad,
           c."COM_PAUTA_FULL"       AS com_pauta_full,
           c."COM_PORC_BASE_DIR"    AS com_porc_base_dir,
           c."COM_PORC_BASE_AGE"    AS com_porc_base_age,
           c."COM_PORC_SUP_DIR"     AS com_porc_sup_dir,
           c."COM_PORC_SUP_AGE"     AS com_porc_sup_age,
           c."COM_ESTADO"           AS com_estado
    FROM fac_comisiones c
    WHERE c."COM_EMPR" = 1 ${where}
    ORDER BY ${orderBy}`;
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

module.exports = { getAll };
