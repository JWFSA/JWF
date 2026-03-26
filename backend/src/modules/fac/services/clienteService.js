const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (c."CLI_NOM" ILIKE $1 OR c."CLI_RUC" ILIKE $1 OR c."CLI_TEL" ILIKE $1)`
    : '';
  const countRes = await pool.query(`SELECT COUNT(*) FROM fin_cliente c ${where}`, params);
  const total = parseInt(countRes.rows[0].count);
  const allowedSort = {
    cod: 'c."CLI_CODIGO"', nom: 'c."CLI_NOM"', ruc: 'c."CLI_RUC"',
    tel: 'c."CLI_TEL"', zona: 'z."ZONA_DESC"', categ: 'cat."FCAT_DESC"', estado: 'c."CLI_EST_CLI"',
  };
  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'c."CLI_NOM" ASC';
  const select = `
    SELECT c."CLI_CODIGO" AS cli_codigo, c."CLI_NOM" AS cli_nom, c."CLI_RUC" AS cli_ruc,
           c."CLI_TEL" AS cli_tel, c."CLI_EMAIL" AS cli_email, c."CLI_EST_CLI" AS cli_est_cli,
           c."CLI_ZONA" AS cli_zona, z."ZONA_DESC" AS zona_desc,
           c."CLI_CATEG" AS cli_categ, cat."FCAT_DESC" AS fcat_desc
    FROM fin_cliente c
    LEFT JOIN fac_zona z ON z."ZONA_CODIGO" = c."CLI_ZONA"
    LEFT JOIN fac_categoria cat ON cat."FCAT_CODIGO" = c."CLI_CATEG"
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
    `SELECT c."CLI_CODIGO" AS cli_codigo, c."CLI_NOM" AS cli_nom, c."CLI_RUC" AS cli_ruc,
     c."CLI_TEL" AS cli_tel, c."CLI_FAX" AS cli_fax, c."CLI_EMAIL" AS cli_email,
     c."CLI_DIR2" AS cli_dir2, c."CLI_LOCALIDAD" AS cli_localidad,
     c."CLI_ZONA" AS cli_zona, z."ZONA_DESC" AS zona_desc,
     c."CLI_CATEG" AS cli_categ, cat."FCAT_DESC" AS fcat_desc,
     c."CLI_PAIS" AS cli_pais, p."PAIS_DESC" AS pais_desc,
     c."CLI_MON" AS cli_mon, m."MON_DESC" AS mon_desc,
     c."CLI_EST_CLI" AS cli_est_cli, c."CLI_IMP_LIM_CR" AS cli_imp_lim_cr,
     c."CLI_BLOQ_LIM_CR" AS cli_bloq_lim_cr, c."CLI_MAX_DIAS_ATRASO" AS cli_max_dias_atraso,
     c."CLI_IND_POTENCIAL" AS cli_ind_potencial, c."CLI_OBS" AS cli_obs,
     c."CLI_PERS_CONTACTO" AS cli_pers_contacto
     FROM fin_cliente c
     LEFT JOIN fac_zona z ON z."ZONA_CODIGO" = c."CLI_ZONA"
     LEFT JOIN fac_categoria cat ON cat."FCAT_CODIGO" = c."CLI_CATEG"
     LEFT JOIN gen_pais p ON p."PAIS_CODIGO" = c."CLI_PAIS"
     LEFT JOIN gen_moneda m ON m."MON_CODIGO" = c."CLI_MON"
     WHERE c."CLI_CODIGO" = $1`, [id]);
  if (!rows.length) throw { status: 404, message: 'Cliente no encontrado' };
  return rows[0];
};

const create = async (data) => {
  const { rows: codeRows } = await pool.query('SELECT COALESCE(MAX("CLI_CODIGO"), 0) + 1 AS next FROM fin_cliente');
  const codigo = codeRows[0].next;
  await pool.query(
    `INSERT INTO fin_cliente
       ("CLI_CODIGO","CLI_NOM","CLI_RUC","CLI_TEL","CLI_FAX","CLI_EMAIL","CLI_DIR2",
        "CLI_LOCALIDAD","CLI_ZONA","CLI_CATEG","CLI_PAIS","CLI_MON","CLI_EST_CLI",
        "CLI_IMP_LIM_CR","CLI_BLOQ_LIM_CR","CLI_MAX_DIAS_ATRASO","CLI_IND_POTENCIAL",
        "CLI_OBS","CLI_PERS_CONTACTO")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
    [
      codigo, data.cli_nom, data.cli_ruc || null, data.cli_tel || null,
      data.cli_fax || null, data.cli_email || null, data.cli_dir2 || null,
      data.cli_localidad || null, data.cli_zona || null, data.cli_categ || null,
      data.cli_pais || null, data.cli_mon || null, data.cli_est_cli || 'A',
      data.cli_imp_lim_cr || 0, data.cli_bloq_lim_cr || 'N', data.cli_max_dias_atraso || 0,
      data.cli_ind_potencial || 'N', data.cli_obs || null, data.cli_pers_contacto || null,
    ]
  );
  return getById(codigo);
};

const update = async (id, data) => {
  const fields = []; const params = [];
  const map = {
    cli_nom: '"CLI_NOM"', cli_ruc: '"CLI_RUC"', cli_tel: '"CLI_TEL"', cli_fax: '"CLI_FAX"',
    cli_email: '"CLI_EMAIL"', cli_dir2: '"CLI_DIR2"', cli_localidad: '"CLI_LOCALIDAD"',
    cli_zona: '"CLI_ZONA"', cli_categ: '"CLI_CATEG"', cli_pais: '"CLI_PAIS"', cli_mon: '"CLI_MON"',
    cli_est_cli: '"CLI_EST_CLI"', cli_imp_lim_cr: '"CLI_IMP_LIM_CR"',
    cli_bloq_lim_cr: '"CLI_BLOQ_LIM_CR"', cli_max_dias_atraso: '"CLI_MAX_DIAS_ATRASO"',
    cli_ind_potencial: '"CLI_IND_POTENCIAL"', cli_obs: '"CLI_OBS"', cli_pers_contacto: '"CLI_PERS_CONTACTO"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (!fields.length) return getById(id);
  params.push(id);
  await pool.query(`UPDATE fin_cliente SET ${fields.join(', ')} WHERE "CLI_CODIGO" = $${params.length}`, params);
  return getById(id);
};

const remove = async (id) => {
  await pool.query('DELETE FROM fin_cliente WHERE "CLI_CODIGO" = $1', [id]);
};

module.exports = { getAll, getById, create, update, remove };
