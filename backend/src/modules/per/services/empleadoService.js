const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const where  = search
    ? `WHERE (e."EMPL_NOMBRE" ILIKE $1 OR e."EMPL_APE" ILIKE $1 OR CAST(e."EMPL_DOC_IDENT" AS TEXT) ILIKE $1 OR e."EMPL_RUC" ILIKE $1)`
    : '';
  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*) FROM per_empleado e ${where}`, params
  );
  const total = parseInt(count);
  const allowedSort = {
    legajo:   'e."EMPL_LEGAJO"',
    nombre:   'e."EMPL_NOMBRE"',
    ape:      'e."EMPL_APE"',
    ingreso:  'e."EMPL_FEC_INGRESO"',
    cargo:    'c."CAR_DESC"',
  };
  const dir     = sortDir === 'desc' ? 'DESC' : 'ASC';
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'e."EMPL_LEGAJO" ASC';
  const select  = `
    SELECT e."EMPL_LEGAJO" AS empl_legajo,
           e."EMPL_NOMBRE" AS empl_nombre, e."EMPL_APE" AS empl_ape,
           e."EMPL_DOC_IDENT" AS empl_doc_ident, e."EMPL_RUC" AS empl_ruc,
           e."EMPL_SITUACION" AS empl_situacion,
           e."EMPL_CARGO" AS empl_cargo, c."CAR_DESC" AS car_desc,
           e."EMPL_CATEG" AS empl_categ, cat."PCAT_DESC" AS pcat_desc,
           e."EMPL_AREA" AS empl_area, a."PER_AREA_DESC" AS area_desc,
           e."EMPL_SECCION" AS empl_seccion, s."PER_SECC_DESC" AS secc_desc,
           e."EMPL_FEC_INGRESO" AS empl_fec_ingreso,
           e."EMPL_FEC_SALIDA" AS empl_fec_salida,
           e."EMPL_SALARIO_BASE" AS empl_salario_base,
           e."EMPL_SEXO" AS empl_sexo,
           e."EMPL_TEL_CELULAR" AS empl_tel_celular,
           e."EMPL_MAIL_PARTICULAR" AS empl_mail_particular
    FROM per_empleado e
    LEFT JOIN per_cargo c       ON c."CAR_CODIGO"    = e."EMPL_CARGO"
    LEFT JOIN per_categoria cat ON cat."PCAT_CODIGO" = e."EMPL_CATEG"
    LEFT JOIN (SELECT DISTINCT ON ("PER_AREA_COD") "PER_AREA_COD", "PER_AREA_DESC" FROM per_area ORDER BY "PER_AREA_COD") a ON a."PER_AREA_COD" = e."EMPL_AREA"
    LEFT JOIN per_seccion s     ON s."PER_SECC_COD"  = e."EMPL_SECCION"
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

const getById = async (legajo) => {
  const { rows } = await pool.query(
    `SELECT e."EMPL_LEGAJO" AS empl_legajo,
            e."EMPL_NOMBRE" AS empl_nombre, e."EMPL_APE" AS empl_ape,
            e."EMPL_DOC_IDENT" AS empl_doc_ident, e."EMPL_RUC" AS empl_ruc,
            e."EMPL_SEXO" AS empl_sexo, e."EMPL_EST_CIVIL" AS empl_est_civil,
            e."EMPL_FEC_NAC" AS empl_fec_nac,
            e."EMPL_NACIONALIDAD" AS empl_nacionalidad,
            e."EMPL_SITUACION" AS empl_situacion,
            e."EMPL_CARGO" AS empl_cargo, c."CAR_DESC" AS car_desc,
            e."EMPL_CATEG" AS empl_categ, cat."PCAT_DESC" AS pcat_desc,
            e."EMPL_AREA" AS empl_area, a."PER_AREA_DESC" AS area_desc,
            e."EMPL_SECCION" AS empl_seccion, s."PER_SECC_DESC" AS secc_desc,
            e."EMPL_TURNO" AS empl_turno, t."TUR_DESC" AS tur_desc,
            e."EMPL_FEC_INGRESO" AS empl_fec_ingreso,
            e."EMPL_FEC_SALIDA" AS empl_fec_salida,
            e."EMPL_MOTIVO_SALIDA" AS empl_motivo_salida,
            e."EMPL_SALARIO_BASE" AS empl_salario_base,
            e."EMPL_NRO_SEG_SOCIAL" AS empl_nro_seg_social,
            e."EMPL_DIR" AS empl_dir, e."EMPL_TEL" AS empl_tel,
            e."EMPL_TEL_CELULAR" AS empl_tel_celular,
            e."EMPL_MAIL_PARTICULAR" AS empl_mail_particular,
            e."EMPL_MAIL_LABORAL" AS empl_mail_laboral,
            e."EMPL_OBSERVA" AS empl_observa
     FROM per_empleado e
     LEFT JOIN per_cargo c       ON c."CAR_CODIGO"    = e."EMPL_CARGO"
     LEFT JOIN per_categoria cat ON cat."PCAT_CODIGO" = e."EMPL_CATEG"
     LEFT JOIN (SELECT DISTINCT ON ("PER_AREA_COD") "PER_AREA_COD", "PER_AREA_DESC" FROM per_area ORDER BY "PER_AREA_COD") a ON a."PER_AREA_COD" = e."EMPL_AREA"
     LEFT JOIN per_seccion s     ON s."PER_SECC_COD"  = e."EMPL_SECCION"
     LEFT JOIN per_turno t       ON t."TUR_CODIGO"    = e."EMPL_TURNO"
     WHERE e."EMPL_LEGAJO" = $1`,
    [legajo]
  );
  if (!rows.length) throw { status: 404, message: 'Empleado no encontrado' };
  return rows[0];
};

const create = async (data) => {
  const { rows: [{ next }] } = await pool.query(`SELECT COALESCE(MAX("EMPL_LEGAJO"), 0) + 1 AS next FROM per_empleado`);
  const legajo = next;
  await pool.query(
    `INSERT INTO per_empleado
     ("EMPL_LEGAJO","EMPL_NOMBRE","EMPL_APE","EMPL_DOC_IDENT","EMPL_RUC",
      "EMPL_SEXO","EMPL_EST_CIVIL","EMPL_FEC_NAC","EMPL_NACIONALIDAD","EMPL_SITUACION",
      "EMPL_CARGO","EMPL_CATEG","EMPL_AREA","EMPL_SECCION","EMPL_TURNO",
      "EMPL_FEC_INGRESO","EMPL_FEC_SALIDA","EMPL_MOTIVO_SALIDA",
      "EMPL_SALARIO_BASE","EMPL_NRO_SEG_SOCIAL",
      "EMPL_DIR","EMPL_TEL","EMPL_TEL_CELULAR",
      "EMPL_MAIL_PARTICULAR","EMPL_MAIL_LABORAL","EMPL_OBSERVA","EMPL_EMPRESA")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)`,
    [
      legajo,
      data.empl_nombre || null, data.empl_ape || null,
      data.empl_doc_ident || null, data.empl_ruc || null,
      data.empl_sexo || null, data.empl_est_civil || null,
      data.empl_fec_nac || null, data.empl_nacionalidad || null,
      data.empl_situacion || 'A',
      data.empl_cargo || null, data.empl_categ || null,
      data.empl_area || null, data.empl_seccion || null, data.empl_turno || null,
      data.empl_fec_ingreso || null, data.empl_fec_salida || null,
      data.empl_motivo_salida || null,
      data.empl_salario_base || null, data.empl_nro_seg_social || null,
      data.empl_dir || null, data.empl_tel || null, data.empl_tel_celular || null,
      data.empl_mail_particular || null, data.empl_mail_laboral || null,
      data.empl_observa || null, 1,
    ]
  );
  return getById(legajo);
};

const update = async (legajo, data) => {
  const fields = []; const params = [];
  const map = {
    empl_nombre:         '"EMPL_NOMBRE"',
    empl_ape:            '"EMPL_APE"',
    empl_doc_ident:      '"EMPL_DOC_IDENT"',
    empl_ruc:            '"EMPL_RUC"',
    empl_sexo:           '"EMPL_SEXO"',
    empl_est_civil:      '"EMPL_EST_CIVIL"',
    empl_fec_nac:        '"EMPL_FEC_NAC"',
    empl_nacionalidad:   '"EMPL_NACIONALIDAD"',
    empl_situacion:      '"EMPL_SITUACION"',
    empl_cargo:          '"EMPL_CARGO"',
    empl_categ:          '"EMPL_CATEG"',
    empl_area:           '"EMPL_AREA"',
    empl_seccion:        '"EMPL_SECCION"',
    empl_turno:          '"EMPL_TURNO"',
    empl_fec_ingreso:    '"EMPL_FEC_INGRESO"',
    empl_fec_salida:     '"EMPL_FEC_SALIDA"',
    empl_motivo_salida:  '"EMPL_MOTIVO_SALIDA"',
    empl_salario_base:   '"EMPL_SALARIO_BASE"',
    empl_nro_seg_social: '"EMPL_NRO_SEG_SOCIAL"',
    empl_dir:            '"EMPL_DIR"',
    empl_tel:            '"EMPL_TEL"',
    empl_tel_celular:    '"EMPL_TEL_CELULAR"',
    empl_mail_particular:'"EMPL_MAIL_PARTICULAR"',
    empl_mail_laboral:   '"EMPL_MAIL_LABORAL"',
    empl_observa:        '"EMPL_OBSERVA"',
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${col} = $${params.length}`); }
  }
  if (fields.length) {
    params.push(legajo);
    await pool.query(`UPDATE per_empleado SET ${fields.join(', ')} WHERE "EMPL_LEGAJO" = $${params.length}`, params);
  }
  return getById(legajo);
};

const remove = async (legajo) => {
  await pool.query(`DELETE FROM per_empleado WHERE "EMPL_LEGAJO" = $1`, [legajo]);
};

module.exports = { getAll, getById, create, update, remove };
