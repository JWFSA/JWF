const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
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
           c."CLI_TEL" AS cli_tel, c."CLI_EMAIL" AS cli_email,
           c."CLI_EMAIL2" AS cli_email2, c."CLI_EMAIL3" AS cli_email3, c."CLI_EMAIL4" AS cli_email4,
           c."CLI_EST_CLI" AS cli_est_cli,
           c."CLI_ZONA" AS cli_zona, z."ZONA_DESC" AS zona_desc,
           c."CLI_CATEG" AS cli_categ, cat."FCAT_DESC" AS fcat_desc,
           c."CLI_VENDEDOR" AS cli_vendedor, c."CLI_TIPO_VTA" AS cli_tipo_vta, c."CLI_COND_VENTA" AS cli_cond_venta,
           c."CLI_MOD_VENTA" AS cli_mod_venta,
           c."CLI_AGENCIA" AS cli_agencia, c."CLI_COMISION_AGEN" AS cli_comision_agen,
           c."CLI_MON" AS cli_mon, c."CLI_DIR2" AS cli_dir2, c."CLI_PERS_CONTACTO" AS cli_pers_contacto,
           c."CLI_IND_EXEN" AS cli_ind_exen
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
     c."CLI_EMAIL2" AS cli_email2, c."CLI_EMAIL3" AS cli_email3, c."CLI_EMAIL4" AS cli_email4,
     c."CLI_DIR2" AS cli_dir2, c."CLI_LOCALIDAD" AS cli_localidad,
     c."CLI_DISTRITO" AS cli_distrito, dist."DIST_DESC" AS dist_desc,
     c."CLI_COD_LOCALIDAD" AS cli_cod_localidad, loc."LOC_DESC" AS loc_desc,
     c."CLI_COD_BARRIO" AS cli_cod_barrio, bar."BARR_DESC" AS barr_desc,
     c."CLI_ZONA" AS cli_zona, z."ZONA_DESC" AS zona_desc,
     c."CLI_CATEG" AS cli_categ, cat."FCAT_DESC" AS fcat_desc,
     c."CLI_PAIS" AS cli_pais, p."PAIS_DESC" AS pais_desc,
     c."CLI_MON" AS cli_mon, m."MON_DESC" AS mon_desc,
     c."CLI_EST_CLI" AS cli_est_cli, c."CLI_IMP_LIM_CR" AS cli_imp_lim_cr,
     c."CLI_BLOQ_LIM_CR" AS cli_bloq_lim_cr, c."CLI_MAX_DIAS_ATRASO" AS cli_max_dias_atraso,
     c."CLI_IND_POTENCIAL" AS cli_ind_potencial, c."CLI_OBS" AS cli_obs,
     c."CLI_PERS_CONTACTO" AS cli_pers_contacto,
     c."CLI_COND_VENTA" AS cli_cond_venta,
     c."CLI_TIPO_VTA" AS cli_tipo_vta, c."CLI_MOD_VENTA" AS cli_mod_venta,
     c."CLI_FEC_ANIV" AS cli_fec_aniv,
     c."CLI_AGENCIA" AS cli_agencia, ag."AGEN_DESC" AS agen_desc, c."CLI_COMISION_AGEN" AS cli_comision_agen,
     c."CLI_VENDEDOR" AS cli_vendedor,
     o."OPER_NOMBRE" AS vend_nombre, o."OPER_APELLIDO" AS vend_apellido,
     c."CLI_NOM_FANTASIA" AS cli_nom_fantasia,
     c."CLI_PERS_REPRESENTANTE" AS cli_pers_representante,
     c."CLI_DOC_IDENT_REPRESENTANTE" AS cli_doc_ident_representante,
     c."CLI_IND_EXEN" AS cli_ind_exen
     FROM fin_cliente c
     LEFT JOIN fac_zona z ON z."ZONA_CODIGO" = c."CLI_ZONA"
     LEFT JOIN fac_categoria cat ON cat."FCAT_CODIGO" = c."CLI_CATEG"
     LEFT JOIN gen_pais p ON p."PAIS_CODIGO" = c."CLI_PAIS"
     LEFT JOIN gen_moneda m ON m."MON_CODIGO" = c."CLI_MON"
     LEFT JOIN fac_vendedor v ON v."VEND_LEGAJO" = c."CLI_VENDEDOR"
     LEFT JOIN gen_operador o ON o."OPER_CODIGO" = v."VEND_OPER"
     LEFT JOIN fac_agencia ag ON ag."AGEN_CODIGO" = c."CLI_AGENCIA"
     LEFT JOIN gen_distrito dist ON dist."DIST_CODIGO" = c."CLI_DISTRITO"
     LEFT JOIN gen_localidad loc ON loc."LOC_CODIGO" = c."CLI_COD_LOCALIDAD"
     LEFT JOIN gen_barrio bar ON bar."BARR_CODIGO" = c."CLI_COD_BARRIO"
     WHERE c."CLI_CODIGO" = $1`, [id]);
  if (!rows.length) throw { status: 404, message: 'Cliente no encontrado' };
  return rows[0];
};

const create = async (data) => {
  const { rows: codeRows } = await pool.query('SELECT COALESCE(MAX("CLI_CODIGO"), 0) + 1 AS next FROM fin_cliente');
  const codigo = codeRows[0].next;
  await pool.query(
    `INSERT INTO fin_cliente
       ("CLI_CODIGO","CLI_NOM","CLI_RUC","CLI_TEL","CLI_FAX","CLI_EMAIL","CLI_EMAIL2","CLI_EMAIL3","CLI_EMAIL4","CLI_DIR2",
        "CLI_LOCALIDAD","CLI_DISTRITO","CLI_COD_LOCALIDAD","CLI_COD_BARRIO",
        "CLI_ZONA","CLI_CATEG","CLI_PAIS","CLI_MON","CLI_EST_CLI",
        "CLI_IMP_LIM_CR","CLI_BLOQ_LIM_CR","CLI_MAX_DIAS_ATRASO","CLI_IND_POTENCIAL",
        "CLI_OBS","CLI_PERS_CONTACTO","CLI_VENDEDOR","CLI_COND_VENTA","CLI_TIPO_VTA","CLI_MOD_VENTA","CLI_FEC_ANIV","CLI_AGENCIA","CLI_COMISION_AGEN",
        "CLI_NOM_FANTASIA","CLI_PERS_REPRESENTANTE","CLI_DOC_IDENT_REPRESENTANTE","CLI_IND_EXEN")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36)`,
    [
      codigo, data.cli_nom, data.cli_ruc || null, data.cli_tel || null,
      data.cli_fax || null, data.cli_email || null, data.cli_email2 || null, data.cli_email3 || null, data.cli_email4 || null,
      data.cli_dir2 || null,
      data.cli_localidad || null, data.cli_distrito || null, data.cli_cod_localidad || null, data.cli_cod_barrio || null,
      data.cli_zona || null, data.cli_categ || null,
      data.cli_pais || null, data.cli_mon || null, data.cli_est_cli || 'A',
      data.cli_imp_lim_cr || 0, data.cli_bloq_lim_cr || 'N', data.cli_max_dias_atraso || 0,
      data.cli_ind_potencial || 'N', data.cli_obs || null, data.cli_pers_contacto || null,
      data.cli_vendedor || null, data.cli_cond_venta || null, data.cli_tipo_vta || null, data.cli_mod_venta || 'D',
      data.cli_fec_aniv || null, data.cli_agencia || null, data.cli_comision_agen || 0,
      data.cli_nom_fantasia || null, data.cli_pers_representante || null, data.cli_doc_ident_representante || null,
      data.cli_ind_exen || 'N',
    ]
  );
  return getById(codigo);
};

const update = async (id, data) => {
  const fields = []; const params = [];
  const map = {
    cli_nom: '"CLI_NOM"', cli_ruc: '"CLI_RUC"', cli_tel: '"CLI_TEL"', cli_fax: '"CLI_FAX"',
    cli_email: '"CLI_EMAIL"', cli_email2: '"CLI_EMAIL2"', cli_email3: '"CLI_EMAIL3"', cli_email4: '"CLI_EMAIL4"',
    cli_dir2: '"CLI_DIR2"', cli_localidad: '"CLI_LOCALIDAD"',
    cli_distrito: '"CLI_DISTRITO"', cli_cod_localidad: '"CLI_COD_LOCALIDAD"', cli_cod_barrio: '"CLI_COD_BARRIO"',
    cli_zona: '"CLI_ZONA"', cli_categ: '"CLI_CATEG"', cli_pais: '"CLI_PAIS"', cli_mon: '"CLI_MON"',
    cli_est_cli: '"CLI_EST_CLI"', cli_imp_lim_cr: '"CLI_IMP_LIM_CR"',
    cli_bloq_lim_cr: '"CLI_BLOQ_LIM_CR"', cli_max_dias_atraso: '"CLI_MAX_DIAS_ATRASO"',
    cli_ind_potencial: '"CLI_IND_POTENCIAL"', cli_obs: '"CLI_OBS"', cli_pers_contacto: '"CLI_PERS_CONTACTO"',
    cli_vendedor: '"CLI_VENDEDOR"', cli_cond_venta: '"CLI_COND_VENTA"', cli_tipo_vta: '"CLI_TIPO_VTA"', cli_mod_venta: '"CLI_MOD_VENTA"',
    cli_fec_aniv: '"CLI_FEC_ANIV"',
    cli_agencia: '"CLI_AGENCIA"', cli_comision_agen: '"CLI_COMISION_AGEN"',
    cli_nom_fantasia: '"CLI_NOM_FANTASIA"', cli_pers_representante: '"CLI_PERS_REPRESENTANTE"',
    cli_doc_ident_representante: '"CLI_DOC_IDENT_REPRESENTANTE"',
    cli_ind_exen: '"CLI_IND_EXEN"',
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
