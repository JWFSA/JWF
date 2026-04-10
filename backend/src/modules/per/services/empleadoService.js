const pool = require('../../../config/db');

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc', cargo = '', situacion = '', area = '' } = {}) => {
  const params = search ? [`%${search}%`] : [];
  const conditions = [];
  if (search) conditions.push(`(e."EMPL_NOMBRE" ILIKE $1 OR e."EMPL_APE" ILIKE $1 OR CAST(e."EMPL_DOC_IDENT" AS TEXT) ILIKE $1 OR e."EMPL_RUC" ILIKE $1)`);
  if (cargo) {
    const cargos = String(cargo).split(',').map(Number).filter(Number.isFinite);
    if (cargos.length === 1) { params.push(cargos[0]); conditions.push(`e."EMPL_CARGO" = $${params.length}`); }
    else if (cargos.length > 1) { const placeholders = cargos.map((c) => { params.push(c); return `$${params.length}`; }); conditions.push(`e."EMPL_CARGO" IN (${placeholders.join(',')})`); }
  }
  if (situacion) { params.push(situacion); conditions.push(`e."EMPL_SITUACION" = $${params.length}`); }
  if (area) { params.push(Number(area)); conditions.push(`e."EMPL_AREA" = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
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
  const orderBy = allowedSort[sortField] ? `${allowedSort[sortField]} ${dir}` : 'e."EMPL_NOMBRE" ASC';
  const select  = `
    SELECT e."EMPL_LEGAJO" AS empl_legajo,
           e."EMPL_NOMBRE" AS empl_nombre, e."EMPL_APE" AS empl_ape,
           e."EMPL_DOC_IDENT" AS empl_doc_ident, e."EMPL_RUC" AS empl_ruc,
           e."EMPL_SITUACION" AS empl_situacion,
           e."EMPL_CARGO" AS empl_cargo, c."CAR_DESC" AS car_desc,
           e."EMPL_CATEG" AS empl_categ, cat."PCAT_DESC" AS pcat_desc,
           e."EMPL_AREA" AS empl_area, a."PER_AREA_DESC" AS area_desc,
           e."EMPL_SECCION" AS empl_seccion, s."PER_SECC_DESC" AS secc_desc,
           e."EMPL_SUCURSAL" AS empl_sucursal, suc."SUC_DESC" AS suc_desc,
           e."EMPL_CCOSTO" AS empl_ccosto, cco."CCO_DESC" AS cco_desc,
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
    LEFT JOIN gen_sucursal suc  ON suc."SUC_CODIGO"  = e."EMPL_SUCURSAL" AND suc."SUC_EMPR" = e."EMPL_EMPRESA"
    LEFT JOIN cnt_ccosto cco    ON cco."CCO_CODIGO"  = e."EMPL_CCOSTO"
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
            pais."PAIS_NACIONALIDAD" AS pais_nacionalidad,
            e."EMPL_SITUACION" AS empl_situacion,
            e."EMPL_CARGO" AS empl_cargo, c."CAR_DESC" AS car_desc,
            e."EMPL_CATEG" AS empl_categ, cat."PCAT_DESC" AS pcat_desc,
            e."EMPL_AREA" AS empl_area, a."PER_AREA_DESC" AS area_desc,
            e."EMPL_SECCION" AS empl_seccion, s."PER_SECC_DESC" AS secc_desc,
            e."EMPL_TURNO" AS empl_turno, t."TUR_DESC" AS tur_desc,
            e."EMPL_SUCURSAL" AS empl_sucursal, suc."SUC_DESC" AS suc_desc,
            e."EMPL_CCOSTO" AS empl_ccosto, cco."CCO_DESC" AS cco_desc,
            e."EMPL_COD_JEFE" AS empl_cod_jefe,
            jefe."EMPL_NOMBRE" AS jefe_nombre, jefe."EMPL_APE" AS jefe_ape,
            e."EMPL_DEPARTAMENTO" AS empl_departamento,
            e."EMPL_FEC_INGRESO" AS empl_fec_ingreso,
            e."EMPL_FEC_SALIDA" AS empl_fec_salida,
            e."EMPL_MOTIVO_SALIDA" AS empl_motivo_salida,
            e."EMPL_SALARIO_BASE" AS empl_salario_base,
            e."EMPL_NRO_SEG_SOCIAL" AS empl_nro_seg_social,
            e."EMPL_CTA_BCO" AS empl_cta_bco, cb."CTA_DESC" AS cta_desc,
            e."EMPL_CTA_CTE" AS empl_cta_cte,
            e."EMPL_TIPO_SALARIO" AS empl_tipo_salario, ts."PTIPO_SAL_DESC" AS tipo_sal_desc,
            e."EMPL_DIURNO" AS empl_diurno,
            e."EMPL_NOCTURNO" AS empl_nocturno,
            e."EMPL_MIXTO1" AS empl_mixto1,
            e."EMPL_MIXTO2" AS empl_mixto2,
            e."EMPL_IMP_HORA_N_D" AS empl_imp_hora_n_d,
            e."EMPL_IMP_HORA_N_N" AS empl_imp_hora_n_n,
            e."EMPL_IMP_HORA_E_D" AS empl_imp_hora_e_d,
            e."EMPL_IMP_HORA_E_N" AS empl_imp_hora_e_n,
            e."EMPL_IMP_HORA_DF_D" AS empl_imp_hora_df_d,
            e."EMPL_TIPO_HORAR" AS empl_tipo_horar,
            e."EMPL_TIEMPO_ALM" AS empl_tiempo_alm,
            e."EMPL_DESC_TIEMP_ALM" AS empl_desc_tiemp_alm,
            e."EMPL_CALC_HR_EXT" AS empl_calc_hr_ext,
            e."EMPL_LIM_LLEG_TEMP" AS empl_lim_lleg_temp,
            e."EMPL_IMP_LLEG_HORA" AS empl_imp_lleg_hora,
            e."EMPL_COBRA_COMISION" AS empl_cobra_comision,
            e."EMPL_BONIF_FLIAR" AS empl_bonif_fliar,
            e."EMPL_IND_ANTICIPOS" AS empl_ind_anticipos,
            e."EMPL_IND_TRAB_SAB" AS empl_ind_trab_sab,
            e."EMPL_DIR" AS empl_dir, e."EMPL_DIR2" AS empl_dir2, e."EMPL_DIR3" AS empl_dir3,
            e."EMPL_PAIS_DIR" AS empl_pais_dir, paisdir."PAIS_DESC" AS pais_dir_desc,
            e."EMPL_DISTRITO" AS empl_distrito, distdir."DIST_DESC" AS distrito_desc,
            e."EMPL_LOCALIDAD" AS empl_localidad, loc."LOC_DESC" AS loc_desc,
            e."EMPL_BARRIO" AS empl_barrio, barr."BARR_DESC" AS barr_desc,
            e."EMPL_NRO_CASA" AS empl_nro_casa,
            e."EMPL_TEL" AS empl_tel,
            e."EMPL_TEL_CELULAR" AS empl_tel_celular,
            e."EMPL_TEL_CORPORAT" AS empl_tel_corporat,
            e."EMPL_MAIL_PARTICULAR" AS empl_mail_particular,
            e."EMPL_MAIL_LABORAL" AS empl_mail_laboral,
            e."EMPL_NOMBRE_EMERGENCIA" AS empl_nombre_emergencia,
            e."EMPL_FEC_INGRESO_IPS" AS empl_fec_ingreso_ips,
            e."EMPL_SITUACION_IPS" AS empl_situacion_ips,
            e."EMPL_FOTO" AS empl_foto,
            e."EMPL_PLUS_OBJETIVO" AS empl_plus_objetivo,
            e."EMPL_OBJ_HMES" AS empl_obj_hmes,
            e."EMPL_OBSERVA" AS empl_observa
     FROM per_empleado e
     LEFT JOIN per_cargo c       ON c."CAR_CODIGO"    = e."EMPL_CARGO"
     LEFT JOIN per_categoria cat ON cat."PCAT_CODIGO" = e."EMPL_CATEG"
     LEFT JOIN (SELECT DISTINCT ON ("PER_AREA_COD") "PER_AREA_COD", "PER_AREA_DESC" FROM per_area ORDER BY "PER_AREA_COD") a ON a."PER_AREA_COD" = e."EMPL_AREA"
     LEFT JOIN per_seccion s     ON s."PER_SECC_COD"  = e."EMPL_SECCION"
     LEFT JOIN per_turno t       ON t."TUR_CODIGO"    = e."EMPL_TURNO"
     LEFT JOIN gen_sucursal suc  ON suc."SUC_CODIGO"  = e."EMPL_SUCURSAL" AND suc."SUC_EMPR" = e."EMPL_EMPRESA"
     LEFT JOIN cnt_ccosto cco    ON cco."CCO_CODIGO"  = e."EMPL_CCOSTO"
     LEFT JOIN per_empleado jefe ON jefe."EMPL_LEGAJO" = e."EMPL_COD_JEFE"
     LEFT JOIN fin_cuenta_bancaria cb ON cb."CTA_CODIGO" = e."EMPL_CTA_BCO" AND cb."CTA_EMPR" = e."EMPL_EMPRESA"
     LEFT JOIN per_tipo_salario ts ON ts."PTIPO_SAL_CODIGO" = e."EMPL_TIPO_SALARIO"
     LEFT JOIN gen_pais pais     ON pais."PAIS_CODIGO"  = CAST(e."EMPL_NACIONALIDAD" AS numeric)
     LEFT JOIN gen_pais paisdir  ON paisdir."PAIS_CODIGO" = e."EMPL_PAIS_DIR"
     LEFT JOIN gen_distrito distdir ON distdir."DIST_CODIGO" = e."EMPL_DISTRITO"
     LEFT JOIN gen_localidad loc ON loc."LOC_CODIGO"    = CAST(e."EMPL_LOCALIDAD" AS numeric)
     LEFT JOIN gen_barrio barr   ON barr."BARR_CODIGO"  = e."EMPL_BARRIO"
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
      "EMPL_SUCURSAL","EMPL_CCOSTO","EMPL_COD_JEFE","EMPL_DEPARTAMENTO",
      "EMPL_FEC_INGRESO","EMPL_FEC_SALIDA","EMPL_MOTIVO_SALIDA",
      "EMPL_SALARIO_BASE","EMPL_NRO_SEG_SOCIAL",
      "EMPL_CTA_BCO","EMPL_CTA_CTE",
      "EMPL_TIPO_SALARIO","EMPL_DIURNO","EMPL_NOCTURNO","EMPL_MIXTO1","EMPL_MIXTO2",
      "EMPL_IMP_HORA_N_D","EMPL_IMP_HORA_N_N","EMPL_IMP_HORA_E_D","EMPL_IMP_HORA_E_N","EMPL_IMP_HORA_DF_D",
      "EMPL_TIPO_HORAR","EMPL_TIEMPO_ALM","EMPL_DESC_TIEMP_ALM","EMPL_CALC_HR_EXT",
      "EMPL_LIM_LLEG_TEMP","EMPL_IMP_LLEG_HORA",
      "EMPL_COBRA_COMISION","EMPL_BONIF_FLIAR","EMPL_IND_ANTICIPOS","EMPL_IND_TRAB_SAB",
      "EMPL_DIR","EMPL_DIR2","EMPL_DIR3","EMPL_PAIS_DIR","EMPL_DISTRITO","EMPL_LOCALIDAD","EMPL_BARRIO","EMPL_NRO_CASA",
      "EMPL_TEL","EMPL_TEL_CELULAR","EMPL_TEL_CORPORAT",
      "EMPL_MAIL_PARTICULAR","EMPL_MAIL_LABORAL","EMPL_NOMBRE_EMERGENCIA",
      "EMPL_FEC_INGRESO_IPS","EMPL_SITUACION_IPS",
      "EMPL_FOTO","EMPL_PLUS_OBJETIVO","EMPL_OBJ_HMES",
      "EMPL_OBSERVA","EMPL_EMPRESA")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
             $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,
             $39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,
             $57,$58,$59,$60,$61,$62,$63,$64,$65)`,
    [
      legajo,
      data.empl_nombre || null, data.empl_ape || null,
      data.empl_doc_ident || null, data.empl_ruc || null,
      data.empl_sexo || null, data.empl_est_civil || null,
      data.empl_fec_nac || null, data.empl_nacionalidad || null,
      data.empl_situacion || 'A',
      data.empl_cargo || null, data.empl_categ || null,
      data.empl_area || null, data.empl_seccion || null, data.empl_turno || null,
      data.empl_sucursal || null, data.empl_ccosto || null,
      data.empl_cod_jefe || null, data.empl_departamento || null,
      data.empl_fec_ingreso || null, data.empl_fec_salida || null,
      data.empl_motivo_salida || null,
      data.empl_salario_base || null, data.empl_nro_seg_social || null,
      data.empl_cta_bco || null, data.empl_cta_cte || null,
      data.empl_tipo_salario || null, data.empl_diurno || null,
      data.empl_nocturno || null, data.empl_mixto1 || null, data.empl_mixto2 || null,
      data.empl_imp_hora_n_d || null, data.empl_imp_hora_n_n || null,
      data.empl_imp_hora_e_d || null, data.empl_imp_hora_e_n || null, data.empl_imp_hora_df_d || null,
      data.empl_tipo_horar || null, data.empl_tiempo_alm || null,
      data.empl_desc_tiemp_alm || null, data.empl_calc_hr_ext || null,
      data.empl_lim_lleg_temp || null, data.empl_imp_lleg_hora || null,
      data.empl_cobra_comision || 'N', data.empl_bonif_fliar || 'N',
      data.empl_ind_anticipos || 'N', data.empl_ind_trab_sab || 'N',
      data.empl_dir || null, data.empl_dir2 || null, data.empl_dir3 || null,
      data.empl_pais_dir || null, data.empl_distrito || null,
      data.empl_localidad || null, data.empl_barrio || null, data.empl_nro_casa || null,
      data.empl_tel || null, data.empl_tel_celular || null, data.empl_tel_corporat || null,
      data.empl_mail_particular || null, data.empl_mail_laboral || null,
      data.empl_nombre_emergencia || null,
      data.empl_fec_ingreso_ips || null, data.empl_situacion_ips || null,
      data.empl_foto || null, data.empl_plus_objetivo || null, data.empl_obj_hmes || null,
      data.empl_observa || null, 1,
    ]
  );
  return getById(legajo);
};

const update = async (legajo, data) => {
  const fields = []; const params = [];
  const map = {
    empl_nombre:          '"EMPL_NOMBRE"',
    empl_ape:             '"EMPL_APE"',
    empl_doc_ident:       '"EMPL_DOC_IDENT"',
    empl_ruc:             '"EMPL_RUC"',
    empl_sexo:            '"EMPL_SEXO"',
    empl_est_civil:       '"EMPL_EST_CIVIL"',
    empl_fec_nac:         '"EMPL_FEC_NAC"',
    empl_nacionalidad:    '"EMPL_NACIONALIDAD"',
    empl_situacion:       '"EMPL_SITUACION"',
    empl_cargo:           '"EMPL_CARGO"',
    empl_categ:           '"EMPL_CATEG"',
    empl_area:            '"EMPL_AREA"',
    empl_seccion:         '"EMPL_SECCION"',
    empl_turno:           '"EMPL_TURNO"',
    empl_sucursal:        '"EMPL_SUCURSAL"',
    empl_ccosto:          '"EMPL_CCOSTO"',
    empl_cod_jefe:        '"EMPL_COD_JEFE"',
    empl_departamento:    '"EMPL_DEPARTAMENTO"',
    empl_fec_ingreso:     '"EMPL_FEC_INGRESO"',
    empl_fec_salida:      '"EMPL_FEC_SALIDA"',
    empl_motivo_salida:   '"EMPL_MOTIVO_SALIDA"',
    empl_salario_base:    '"EMPL_SALARIO_BASE"',
    empl_nro_seg_social:  '"EMPL_NRO_SEG_SOCIAL"',
    empl_cta_bco:         '"EMPL_CTA_BCO"',
    empl_cta_cte:         '"EMPL_CTA_CTE"',
    empl_tipo_salario:    '"EMPL_TIPO_SALARIO"',
    empl_diurno:          '"EMPL_DIURNO"',
    empl_nocturno:        '"EMPL_NOCTURNO"',
    empl_mixto1:          '"EMPL_MIXTO1"',
    empl_mixto2:          '"EMPL_MIXTO2"',
    empl_imp_hora_n_d:    '"EMPL_IMP_HORA_N_D"',
    empl_imp_hora_n_n:    '"EMPL_IMP_HORA_N_N"',
    empl_imp_hora_e_d:    '"EMPL_IMP_HORA_E_D"',
    empl_imp_hora_e_n:    '"EMPL_IMP_HORA_E_N"',
    empl_imp_hora_df_d:   '"EMPL_IMP_HORA_DF_D"',
    empl_tipo_horar:      '"EMPL_TIPO_HORAR"',
    empl_tiempo_alm:      '"EMPL_TIEMPO_ALM"',
    empl_desc_tiemp_alm:  '"EMPL_DESC_TIEMP_ALM"',
    empl_calc_hr_ext:     '"EMPL_CALC_HR_EXT"',
    empl_lim_lleg_temp:   '"EMPL_LIM_LLEG_TEMP"',
    empl_imp_lleg_hora:   '"EMPL_IMP_LLEG_HORA"',
    empl_cobra_comision:  '"EMPL_COBRA_COMISION"',
    empl_bonif_fliar:     '"EMPL_BONIF_FLIAR"',
    empl_ind_anticipos:   '"EMPL_IND_ANTICIPOS"',
    empl_ind_trab_sab:    '"EMPL_IND_TRAB_SAB"',
    empl_dir:             '"EMPL_DIR"',
    empl_dir2:            '"EMPL_DIR2"',
    empl_dir3:            '"EMPL_DIR3"',
    empl_pais_dir:        '"EMPL_PAIS_DIR"',
    empl_distrito:        '"EMPL_DISTRITO"',
    empl_localidad:       '"EMPL_LOCALIDAD"',
    empl_barrio:          '"EMPL_BARRIO"',
    empl_nro_casa:        '"EMPL_NRO_CASA"',
    empl_tel:             '"EMPL_TEL"',
    empl_tel_celular:     '"EMPL_TEL_CELULAR"',
    empl_tel_corporat:    '"EMPL_TEL_CORPORAT"',
    empl_mail_particular: '"EMPL_MAIL_PARTICULAR"',
    empl_mail_laboral:    '"EMPL_MAIL_LABORAL"',
    empl_nombre_emergencia: '"EMPL_NOMBRE_EMERGENCIA"',
    empl_fec_ingreso_ips: '"EMPL_FEC_INGRESO_IPS"',
    empl_situacion_ips:   '"EMPL_SITUACION_IPS"',
    empl_foto:            '"EMPL_FOTO"',
    empl_plus_objetivo:   '"EMPL_PLUS_OBJETIVO"',
    empl_obj_hmes:        '"EMPL_OBJ_HMES"',
    empl_observa:         '"EMPL_OBSERVA"',
  };
  // Campos FK donde 0 debe interpretarse como null
  const fkZeroAsNull = new Set([
    'empl_cargo', 'empl_categ', 'empl_area', 'empl_seccion', 'empl_turno',
    'empl_sucursal', 'empl_ccosto', 'empl_cod_jefe', 'empl_departamento',
    'empl_pais_dir', 'empl_distrito', 'empl_localidad', 'empl_barrio',
    'empl_tipo_salario', 'empl_cta_bco', 'empl_nacionalidad', 'empl_motivo_salida',
  ]);
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) {
      const val = fkZeroAsNull.has(k) && (data[k] === 0 || data[k] === '0') ? null : data[k];
      params.push(val); fields.push(`${col} = $${params.length}`);
    }
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
