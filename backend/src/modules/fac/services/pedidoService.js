const pool = require('../../../config/db');

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────

const getAll = async ({ page = 1, limit = 20, search = '', all = false, sortField = '', sortDir = 'asc', tipo = '', fechaDesde = '', fechaHasta = '', estado = '', vendedor = '' } = {}) => {
  page  = Math.max(1, page);
  limit = Math.max(1, Math.min(1000, limit));
  const params = [];
  const conditions = [];
  if (tipo) { params.push(tipo); conditions.push(`p."PED_TIPO" = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(c."CLI_NOM" ILIKE $${params.length} OR CAST(p."PED_NRO" AS TEXT) ILIKE $${params.length} OR p."PED_PRODUCTO" ILIKE $${params.length})`);
  }
  if (fechaDesde) { params.push(fechaDesde); conditions.push(`p."PED_FECHA" >= $${params.length}`); }
  if (fechaHasta) { params.push(fechaHasta); conditions.push(`p."PED_FECHA" <= $${params.length}`); }
  if (estado) { params.push(estado); conditions.push(`p."PED_ESTADO" = $${params.length}`); }
  if (vendedor) { params.push(vendedor); conditions.push(`p."PED_VENDEDOR" = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
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
           p."PED_TIPO" AS ped_tipo,
           p."PED_ESTADO" AS ped_estado, p."PED_IMP_TOTAL_MON" AS ped_imp_total_mon,
           p."PED_IMP_DCTO_MON" AS ped_imp_dcto_mon, p."PED_IMP_FACTURADO" AS ped_imp_facturado,
           p."PED_COND_VENTA" AS ped_cond_venta, p."PED_MON" AS ped_mon,
           p."PED_CLI" AS ped_cli, c."CLI_NOM" AS cli_nom,
           p."PED_VENDEDOR" AS ped_vendedor,
           o."OPER_NOMBRE" AS vend_nombre, o."OPER_APELLIDO" AS vend_apellido,
           p."PED_PRODUCTO" AS ped_producto, p."PED_IND_HAB_FAC" AS ped_ind_hab_fac,
           p."PED_DIAS_VALIDEZ" AS ped_dias_validez
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
    `SELECT
       p."PED_CLAVE" AS ped_clave, p."PED_EMPR" AS ped_empr, p."PED_SUC" AS ped_suc,
       p."PED_NRO" AS ped_nro, p."PED_TIPO" AS ped_tipo, p."PED_IND_PRD" AS ped_ind_prd,
       p."PED_ESTADO" AS ped_estado, p."PED_FECHA" AS ped_fecha,
       p."PED_MON" AS ped_mon, m."MON_DESC" AS mon_desc,
       p."PED_CLI" AS ped_cli, c."CLI_NOM" AS cli_nom, c."CLI_RUC" AS cli_ruc,
       p."PED_CONTACTO" AS ped_contacto, p."PED_TEL" AS ped_tel, p."PED_RUC" AS ped_ruc,
       p."PED_CAMPANHA" AS ped_campanha,
       p."PED_VENDEDOR" AS ped_vendedor,
       o."OPER_NOMBRE" AS vend_nombre, o."OPER_APELLIDO" AS vend_apellido,
       p."PED_COND_VENTA" AS ped_cond_venta,
       p."PED_PRODUCTO" AS ped_producto, p."PED_CONCEPTO" AS ped_concepto,
       p."PED_OBS" AS ped_obs,
       p."PED_NRO_ORCO" AS ped_nro_orco, p."PED_FEC_ORCO" AS ped_fec_orco,
       p."PED_FEC_ENTREG_REQ" AS ped_fec_entreg_req, p."PED_FEC_ENTREG_PRD" AS ped_fec_entreg_prd,
       p."PED_TIPO_FAC" AS ped_tipo_fac, p."PED_DEP" AS ped_dep,
       p."PED_IND_FAC_ADEL" AS ped_ind_fab_adel, p."PED_IND_HAB_FAC" AS ped_ind_hab_fac,
       p."PED_FTO_IMP" AS ped_fto_imp,
       p."PED_IMP_DCTO_MON" AS ped_imp_dcto_mon, p."PED_IMP_TOTAL_MON" AS ped_imp_total_mon,
       p."PED_IND_REQ_REM" AS ped_ind_req_rem,
       p."PED_DIAS_VALIDEZ" AS ped_dias_validez, p."PED_TIEMPO_REALIZ" AS ped_tiempo_realiz,
       p."PED_IND_GAR_FUN" AS ped_ind_gar_fun,
       p."PED_IMP_FACTURADO" AS ped_imp_facturado, p."PED_IMP_DCTO_APLIC" AS ped_imp_dcto_aplic,
       p."PED_NRO_ANT" AS ped_nro_ant, p."PED_CLI_PORC_EX" AS ped_cli_porc_ex,
       p."PED_FEC_CIERRE" AS ped_fec_cierre, p."PED_TASA_US" AS ped_tasa_us,
       p."PED_RUTA_CONTRATO" AS ped_ruta_contrato, p."PED_CLI_OBS" AS ped_cli_obs,
       p."PED_IND_FAC" AS ped_ind_fac,
       p."PED_CLI_NOM" AS ped_cli_nom, p."PED_CLI_DIR" AS ped_cli_dir,
       p."PED_CLI_TEL" AS ped_cli_tel, p."PED_CLI_RUC" AS ped_cli_ruc,
       p."PED_FEC_ENVIO" AS ped_fec_envio, p."PED_APROBADO" AS ped_aprobado,
       p."PED_LIST_PRECIO" AS ped_list_precio,
       p."PED_PLAN_FINAN" AS ped_plan_finan, p."PED_TIPO_FACTURA" AS ped_tipo_factura,
       p."PED_DOC_CLAVE" AS ped_doc_clave, p."PED_OPERADOR" AS ped_operador,
       p."PED_TIPO_DEPOSITO" AS ped_tipo_deposito,
       p."PED_PORC_DTO" AS ped_porc_dto, p."PED_PORC_RGO" AS ped_porc_rgo,
       p."PED_FECH_AUTO" AS ped_fech_auto, p."PED_LOGIN_AUTO" AS ped_login_auto,
       p."PED_FEC_ESTADO" AS ped_fec_estado, p."PED_LOGIN_ESTADO" AS ped_login_estado,
       p."PED_CLI_SUC" AS ped_cli_suc, p."PED_NRO_OT" AS ped_nro_ot,
       p."PED_FORMA_PAGO" AS ped_forma_pago,
       p."PED_IND_ESTADO" AS ped_ind_estado, p."PED_IND_TIPO" AS ped_ind_tipo,
       p."PED_FEC_PEDIDO" AS ped_fec_pedido,
       p."PED_OBS_RECHAZO" AS ped_obs_rechazo, p."PED_FEC_RECHAZO" AS ped_fec_rechazo,
       p."PED_USER_RECHAZO" AS ped_user_rechazo,
       p."PED_CLAVE_PROYECTO" AS ped_clave_proyecto, p."PED_CLAVE_PADRE" AS ped_clave_padre,
       p."PED_NRO_PROYECTO" AS ped_nro_proyecto, p."PED_PROCESADO" AS ped_procesado,
       p."PED_CLAVE_MIGRA" AS ped_clave_migra, p."PED_IND_CANJE" AS ped_ind_canje,
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
    `SELECT
       d."PDET_CLAVE_PED" AS pdet_clave_ped, d."PDET_NRO_ITEM" AS pdet_nro_item,
       d."PDET_ART" AS pdet_art, a."ART_DESC" AS art_desc, a."ART_UNID_MED" AS art_unid_med,
       d."PDET_UM_PED" AS pdet_um_ped, d."PDET_UM_ART" AS pdet_um_art,
       d."PDET_TIPO_F" AS pdet_tipo_f, d."PDET_FACTOR" AS pdet_factor,
       d."PDET_CANT_PED" AS pdet_cant_ped, d."PDET_PRECIO" AS pdet_precio,
       d."PDET_PORC_DCTO" AS pdet_porc_dcto, d."PDET_IMP_DCTO_DET" AS pdet_imp_dcto_det,
       d."PDET_IMP_NETO_DET" AS pdet_imp_neto_det,
       d."PDET_CANT_UM_ART" AS pdet_cant_um_art, d."PDET_PRECIO_UM_ART" AS pdet_precio_um_art,
       d."PDET_IMP_NETO_FINAL" AS pdet_imp_neto_final,
       d."PDET_DESC_LARGA" AS pdet_desc_larga,
       -- Producción
       d."PDET_CALID_IMP" AS pdet_calid_imp, d."PDET_IND_MED" AS pdet_ind_med,
       d."PDET_IND_IMP_DIG" AS pdet_ind_imp_dig, d."PDET_TIPO_OT" AS pdet_tipo_ot,
       d."PDET_TIPO_PROD" AS pdet_tipo_prod, d."PDET_RESOLUCION" AS pdet_resolucion,
       d."PDET_NRO_LADOS_IMP" AS pdet_nro_lados_imp, d."PDET_IND_PRU_COLOR" AS pdet_ind_pru_color,
       d."PDET_IND_DISENHO" AS pdet_ind_disenho,
       -- Dimensiones
       d."PDET_MED_BASE" AS pdet_med_base, d."PDET_MED_ALTO" AS pdet_med_alto,
       d."PDET_MED_TOTAL" AS pdet_med_total,
       d."PDET_MED_BASE_T" AS pdet_med_base_t, d."PDET_MED_ALTO_T" AS pdet_med_alto_t,
       d."PDET_MED_TOTAL_T" AS pdet_med_total_t,
       -- Costos
       d."PDET_COSTO_AR" AS pdet_costo_ar, d."PDET_COSTO_TOT" AS pdet_costo_tot,
       d."PDET_PRECIO_LISTA" AS pdet_precio_lista,
       d."PDET_LIST_PRECIO" AS pdet_list_precio, d."PDET_LISTA_PRECIO" AS pdet_lista_precio,
       -- Cantidades
       d."PDET_CANT_PROD" AS pdet_cant_prod, d."PDET_CONTENIDO" AS pdet_contenido,
       d."PDET_CANT_FRACCION" AS pdet_cant_fraccion, d."PDET_CANT_CAJA" AS pdet_cant_caja,
       d."PDET_CANT" AS pdet_cant,
       -- Facturación
       d."PDET_CANT_FACT" AS pdet_cant_fact, d."PDET_CANT_FACT_UM_AR" AS pdet_cant_fact_um_ar,
       d."PDET_CANT_DOC_FA" AS pdet_cant_doc_fa, d."PDET_CANT_DOC_NC" AS pdet_cant_doc_nc,
       d."PDET_IMP_FACTU" AS pdet_imp_factu,
       d."PDET_IMP_NETO_MON" AS pdet_imp_neto_mon, d."PDET_IVA_MON" AS pdet_iva_mon,
       d."PDET_COD_IMPU" AS pdet_cod_impu, d."PDET_TOTAL_MON" AS pdet_total_mon,
       d."PDET_IMP_TOT_NET_GS" AS pdet_imp_tot_net_gs, d."PDET_IMP_TOT_NET_US" AS pdet_imp_tot_net_us,
       d."PDET_IMP_IVA_GS" AS pdet_imp_iva_gs, d."PDET_IMP_IVA_US" AS pdet_imp_iva_us,
       -- Descuentos
       d."PDET_IMP_DCTO_CAB" AS pdet_imp_dcto_cab, d."PDET_IMP_DCTO_CAB_AP" AS pdet_imp_dcto_cab_ap,
       d."PDET_IMP_DCTOD_APLIC" AS pdet_imp_dctod_aplic,
       d."PDET_PORC_DTO" AS pdet_porc_dto,
       d."PDET_IND_DTO_AUTORIZADO" AS pdet_ind_dto_autorizado, d."PDET_DTO_LOGIN" AS pdet_dto_login,
       d."PDET_IND_MODIF_DET_AUTORIZADO" AS pdet_ind_modif_det_autorizado,
       d."PDET_MODIF_DET_LOGIN" AS pdet_modif_det_login,
       -- Conversión
       d."PDET_ART_FACTOR_CONVERSION" AS pdet_art_factor_conversion,
       d."PDET_ART_BONIF" AS pdet_art_bonif, d."PDET_CODIGO_BARRA" AS pdet_codigo_barra,
       -- Contratos / Fechas
       d."PDET_FEC_INI_CONT" AS pdet_fec_ini_cont, d."PDET_FEC_FIN_CONT" AS pdet_fec_fin_cont,
       d."PDET_DURACION" AS pdet_duracion, d."PDET_SEGUNDOS" AS pdet_segundos,
       d."PDET_INSERCIONES" AS pdet_inserciones, d."PDET_TOT_SEG_DIA" AS pdet_tot_seg_dia,
       -- Referencias
       d."PDET_CLAVE_CO" AS pdet_clave_co, d."PDET_NRO_ITEM_CO" AS pdet_nro_item_co,
       d."PDET_CLAVE_PED_INI" AS pdet_clave_ped_ini, d."PDET_NRO_ITEM_P_INI" AS pdet_nro_item_p_ini,
       d."PDET_CLAVE_PEDIDO" AS pdet_clave_pedido,
       d."PDET_CLAVE_PRO" AS pdet_clave_pro, d."PDET_ITEM_PRO" AS pdet_item_pro,
       d."PDET_COD_INSER" AS pdet_cod_inser, d."PDET_PROV" AS pdet_prov,
       -- Indicadores
       d."PDET_IND_TERC" AS pdet_ind_terc, d."PDET_IND_PRE_DET" AS pdet_ind_pre_det,
       d."PDET_IND_STK" AS pdet_ind_stk, d."PDET_IND_AUT" AS pdet_ind_aut,
       d."PDET_IND_VC" AS pdet_ind_vc,
       -- Observación
       d."PDET_OBS" AS pdet_obs,
       -- Migración
       d."PDET_CLAVE_MIGRA" AS pdet_clave_migra
     FROM fac_pedido_det d
     LEFT JOIN stk_articulo a ON a."ART_CODIGO" = d."PDET_ART"
     WHERE d."PDET_CLAVE_PED" = $1
     ORDER BY d."PDET_NRO_ITEM"`,
    [id]
  );
  pedido.items = items;

  // OTs vinculadas
  const { rows: ordenesTrabajo } = await pool.query(
    `SELECT ot."OT_CLAVE" AS ot_clave, ot."OT_NRO" AS ot_nro, ot."OT_SERIE" AS ot_serie,
            ot."OT_DESC" AS ot_desc, ot."OT_SITUACION" AS ot_situacion,
            ot."OT_NRO_ITEM_PED" AS ot_nro_item_ped, ot."OT_FEC_EMIS" AS ot_fec_emis,
            t."TIPO_DESC" AS tipo_desc
     FROM prd_orden_trabajo ot
     LEFT JOIN prd_tipo_ot t ON t."TIPO_CODIGO" = ot."OT_TIPO"
     WHERE ot."OT_CLAVE_PED" = $1
     ORDER BY ot."OT_NRO_ITEM_PED", ot."OT_NRO"`,
    [id]
  );
  pedido.ordenes_trabajo = ordenesTrabajo;

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
        "PDET_IMP_DCTO_DET","PDET_IMP_NETO_DET","PDET_CANT_UM_ART","PDET_PRECIO_UM_ART",
        "PDET_IMP_NETO_FINAL","PDET_DESC_LARGA",
        "PDET_CALID_IMP","PDET_IND_MED","PDET_IND_IMP_DIG","PDET_TIPO_OT","PDET_TIPO_PROD",
        "PDET_RESOLUCION","PDET_NRO_LADOS_IMP","PDET_IND_PRU_COLOR","PDET_IND_DISENHO",
        "PDET_MED_BASE","PDET_MED_ALTO","PDET_MED_TOTAL",
        "PDET_MED_BASE_T","PDET_MED_ALTO_T","PDET_MED_TOTAL_T",
        "PDET_COSTO_AR","PDET_COSTO_TOT","PDET_PRECIO_LISTA",
        "PDET_LIST_PRECIO","PDET_LISTA_PRECIO",
        "PDET_CANT_PROD","PDET_CONTENIDO","PDET_CANT_FRACCION","PDET_CANT_CAJA","PDET_CANT",
        "PDET_CANT_FACT","PDET_CANT_FACT_UM_AR","PDET_CANT_DOC_FA","PDET_CANT_DOC_NC",
        "PDET_IMP_FACTU","PDET_IMP_NETO_MON","PDET_IVA_MON","PDET_COD_IMPU","PDET_TOTAL_MON",
        "PDET_IMP_TOT_NET_GS","PDET_IMP_TOT_NET_US","PDET_IMP_IVA_GS","PDET_IMP_IVA_US",
        "PDET_IMP_DCTO_CAB","PDET_IMP_DCTO_CAB_AP","PDET_IMP_DCTOD_APLIC",
        "PDET_PORC_DTO","PDET_IND_DTO_AUTORIZADO","PDET_DTO_LOGIN",
        "PDET_IND_MODIF_DET_AUTORIZADO","PDET_MODIF_DET_LOGIN",
        "PDET_ART_FACTOR_CONVERSION","PDET_ART_BONIF","PDET_CODIGO_BARRA",
        "PDET_FEC_INI_CONT","PDET_FEC_FIN_CONT","PDET_DURACION",
        "PDET_SEGUNDOS","PDET_INSERCIONES","PDET_TOT_SEG_DIA",
        "PDET_CLAVE_CO","PDET_NRO_ITEM_CO","PDET_CLAVE_PED_INI","PDET_NRO_ITEM_P_INI",
        "PDET_CLAVE_PEDIDO","PDET_CLAVE_PRO","PDET_ITEM_PRO","PDET_COD_INSER","PDET_PROV",
        "PDET_IND_TERC","PDET_IND_PRE_DET","PDET_IND_STK","PDET_IND_AUT","PDET_IND_VC",
        "PDET_OBS","PDET_CLAVE_MIGRA")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
               $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,
               $39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,
               $57,$58,$59,$60,$61,$62,$63,$64,$65,$66,$67,$68,$69,$70,$71,$72,$73,$74,
               $75,$76,$77,$78,$79,$80,$81,$82,$83,$84,$85,$86,$87)`,
      [
        clave, i + 1, it.pdet_art,
        it.pdet_um_ped || 'U', it.pdet_um_art || it.pdet_um_ped || 'U',
        it.pdet_tipo_f || 'N', it.pdet_factor ?? 1,
        it.pdet_cant_ped, it.pdet_precio || 0, it.pdet_porc_dcto || 0,
        it.pdet_imp_dcto_det || 0, neto,
        it.pdet_cant_um_art ?? it.pdet_cant_ped, it.pdet_precio_um_art ?? (it.pdet_precio || 0),
        it.pdet_imp_neto_final ?? neto, it.pdet_desc_larga || null,
        // Producción
        it.pdet_calid_imp ?? null, it.pdet_ind_med ?? null,
        it.pdet_ind_imp_dig ?? null, it.pdet_tipo_ot ?? null, it.pdet_tipo_prod ?? null,
        it.pdet_resolucion ?? null, it.pdet_nro_lados_imp ?? null,
        it.pdet_ind_pru_color ?? null, it.pdet_ind_disenho ?? null,
        // Dimensiones
        it.pdet_med_base ?? null, it.pdet_med_alto ?? null, it.pdet_med_total ?? null,
        it.pdet_med_base_t ?? null, it.pdet_med_alto_t ?? null, it.pdet_med_total_t ?? null,
        // Costos
        it.pdet_costo_ar ?? null, it.pdet_costo_tot ?? null, it.pdet_precio_lista ?? null,
        it.pdet_list_precio ?? null, it.pdet_lista_precio ?? null,
        // Cantidades
        it.pdet_cant_prod ?? null, it.pdet_contenido ?? null,
        it.pdet_cant_fraccion ?? null, it.pdet_cant_caja ?? null, it.pdet_cant ?? null,
        // Facturación
        it.pdet_cant_fact ?? null, it.pdet_cant_fact_um_ar ?? null,
        it.pdet_cant_doc_fa ?? null, it.pdet_cant_doc_nc ?? null,
        it.pdet_imp_factu ?? null, it.pdet_imp_neto_mon ?? null,
        it.pdet_iva_mon ?? null, it.pdet_cod_impu ?? null, it.pdet_total_mon ?? null,
        it.pdet_imp_tot_net_gs ?? null, it.pdet_imp_tot_net_us ?? null,
        it.pdet_imp_iva_gs ?? null, it.pdet_imp_iva_us ?? null,
        // Descuentos
        it.pdet_imp_dcto_cab ?? null, it.pdet_imp_dcto_cab_ap ?? null,
        it.pdet_imp_dctod_aplic ?? null,
        it.pdet_porc_dto ?? null, it.pdet_ind_dto_autorizado ?? null, it.pdet_dto_login ?? null,
        it.pdet_ind_modif_det_autorizado ?? null, it.pdet_modif_det_login ?? null,
        // Conversión
        it.pdet_art_factor_conversion ?? null, it.pdet_art_bonif ?? null,
        it.pdet_codigo_barra ?? null,
        // Contratos / Fechas
        it.pdet_fec_ini_cont || null, it.pdet_fec_fin_cont || null,
        it.pdet_duracion ?? null, it.pdet_segundos ?? null,
        it.pdet_inserciones ?? null, it.pdet_tot_seg_dia ?? null,
        // Referencias
        it.pdet_clave_co ?? null, it.pdet_nro_item_co ?? null,
        it.pdet_clave_ped_ini ?? null, it.pdet_nro_item_p_ini ?? null,
        it.pdet_clave_pedido ?? null, it.pdet_clave_pro ?? null,
        it.pdet_item_pro ?? null, it.pdet_cod_inser ?? null, it.pdet_prov ?? null,
        // Indicadores
        it.pdet_ind_terc ?? null, it.pdet_ind_pre_det ?? null,
        it.pdet_ind_stk ?? null, it.pdet_ind_aut ?? null, it.pdet_ind_vc ?? null,
        // Observación
        it.pdet_obs ?? null,
        // Migración
        it.pdet_clave_migra ?? null,
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
        "PED_ESTADO","PED_FECHA","PED_MON","PED_CLI",
        "PED_CONTACTO","PED_TEL","PED_RUC","PED_CAMPANHA",
        "PED_VENDEDOR","PED_IND_TIPO","PED_COND_VENTA",
        "PED_PRODUCTO","PED_CONCEPTO","PED_OBS",
        "PED_NRO_ORCO","PED_FEC_ORCO","PED_FEC_ENTREG_REQ","PED_FEC_ENTREG_PRD",
        "PED_TIPO_FAC","PED_DEP","PED_IND_FAC_ADEL","PED_IND_HAB_FAC","PED_FTO_IMP",
        "PED_IMP_DCTO_MON","PED_IMP_TOTAL_MON",
        "PED_IND_REQ_REM","PED_DIAS_VALIDEZ","PED_TIEMPO_REALIZ","PED_IND_GAR_FUN",
        "PED_IMP_FACTURADO","PED_IMP_DCTO_APLIC",
        "PED_CLI_PORC_EX","PED_TASA_US",
        "PED_IND_FAC","PED_FEC_GRAB","PED_LOGIN",
        "PED_CLI_NOM","PED_CLI_DIR","PED_CLI_TEL","PED_CLI_RUC",
        "PED_PORC_DTO","PED_PORC_RGO",
        "PED_LIST_PRECIO","PED_PLAN_FINAN","PED_TIPO_FACTURA",
        "PED_OPERADOR","PED_TIPO_DEPOSITO","PED_FORMA_PAGO",
        "PED_IND_CANJE")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
               $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,
               $39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55)`,
      [
        clave, 1, 1, nro, data.ped_tipo || 'V', data.ped_ind_prd || 'N',
        data.ped_estado || 'P', data.ped_fecha, data.ped_mon || 1, data.ped_cli || null,
        data.ped_contacto || null, data.ped_tel || null, data.ped_ruc || null,
        data.ped_campanha || null,
        data.ped_vendedor || null, data.ped_ind_tipo || null, data.ped_cond_venta || null,
        data.ped_producto || null, data.ped_concepto || null, data.ped_obs || null,
        data.ped_nro_orco || null, data.ped_fec_orco || null,
        data.ped_fec_entreg_req || null, data.ped_fec_entreg_prd || null,
        data.ped_tipo_fac || null, data.ped_dep || null,
        data.ped_ind_fab_adel || 'N', data.ped_ind_hab_fac || 'N', data.ped_fto_imp || null,
        data.ped_imp_dcto_mon || 0, total,
        data.ped_ind_req_rem || 'N', data.ped_dias_validez || null,
        data.ped_tiempo_realiz || null, data.ped_ind_gar_fun || 'N',
        0, 0,
        data.ped_cli_porc_ex || 0, data.ped_tasa_us || 0,
        'P', new Date().toISOString().split('T')[0], login,
        data.ped_cli_nom || null, data.ped_cli_dir || null,
        data.ped_cli_tel || null, data.ped_cli_ruc || null,
        data.ped_porc_dto || 0, data.ped_porc_rgo || 0,
        data.ped_list_precio || null, data.ped_plan_finan || null,
        data.ped_tipo_factura || null,
        data.ped_operador || null, data.ped_tipo_deposito || null,
        data.ped_forma_pago || null,
        data.ped_ind_canje || null,
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
      ped_tipo: '"PED_TIPO"', ped_ind_prd: '"PED_IND_PRD"',
      ped_fecha: '"PED_FECHA"', ped_cli: '"PED_CLI"', ped_vendedor: '"PED_VENDEDOR"',
      ped_ind_tipo: '"PED_IND_TIPO"', ped_cond_venta: '"PED_COND_VENTA"', ped_mon: '"PED_MON"',
      ped_producto: '"PED_PRODUCTO"', ped_concepto: '"PED_CONCEPTO"',
      ped_obs: '"PED_OBS"', ped_estado: '"PED_ESTADO"',
      ped_contacto: '"PED_CONTACTO"', ped_tel: '"PED_TEL"', ped_ruc: '"PED_RUC"',
      ped_campanha: '"PED_CAMPANHA"',
      ped_nro_orco: '"PED_NRO_ORCO"', ped_fec_orco: '"PED_FEC_ORCO"',
      ped_fec_entreg_req: '"PED_FEC_ENTREG_REQ"', ped_fec_entreg_prd: '"PED_FEC_ENTREG_PRD"',
      ped_tipo_fac: '"PED_TIPO_FAC"', ped_dep: '"PED_DEP"',
      ped_ind_fab_adel: '"PED_IND_FAC_ADEL"', ped_ind_hab_fac: '"PED_IND_HAB_FAC"',
      ped_fto_imp: '"PED_FTO_IMP"',
      ped_imp_dcto_mon: '"PED_IMP_DCTO_MON"',
      ped_ind_req_rem: '"PED_IND_REQ_REM"', ped_dias_validez: '"PED_DIAS_VALIDEZ"',
      ped_tiempo_realiz: '"PED_TIEMPO_REALIZ"', ped_ind_gar_fun: '"PED_IND_GAR_FUN"',
      ped_cli_porc_ex: '"PED_CLI_PORC_EX"', ped_fec_cierre: '"PED_FEC_CIERRE"',
      ped_tasa_us: '"PED_TASA_US"', ped_ruta_contrato: '"PED_RUTA_CONTRATO"',
      ped_ind_fac: '"PED_IND_FAC"',
      ped_cli_nom: '"PED_CLI_NOM"', ped_cli_dir: '"PED_CLI_DIR"',
      ped_cli_tel: '"PED_CLI_TEL"', ped_cli_ruc: '"PED_CLI_RUC"',
      ped_fec_envio: '"PED_FEC_ENVIO"', ped_aprobado: '"PED_APROBADO"',
      ped_list_precio: '"PED_LIST_PRECIO"',
      ped_plan_finan: '"PED_PLAN_FINAN"', ped_tipo_factura: '"PED_TIPO_FACTURA"',
      ped_operador: '"PED_OPERADOR"', ped_tipo_deposito: '"PED_TIPO_DEPOSITO"',
      ped_porc_dto: '"PED_PORC_DTO"', ped_porc_rgo: '"PED_PORC_RGO"',
      ped_nro_ot: '"PED_NRO_OT"', ped_forma_pago: '"PED_FORMA_PAGO"',
      ped_ind_canje: '"PED_IND_CANJE"',
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

const getParaFacturar = async (id) => {
  const pedido = await getById(id);
  return {
    ped_clave: pedido.ped_clave,
    doc_fec_doc: new Date().toISOString().split('T')[0],
    doc_cli: pedido.ped_cli,
    cli_nom: pedido.cli_nom,
    doc_cli_nom: pedido.cli_nom,
    doc_cli_ruc: pedido.cli_ruc || null,
    doc_cond_vta: pedido.ped_cond_venta || null,
    doc_mon: pedido.ped_mon || 1,
    doc_obs: pedido.ped_obs || null,
    items: (pedido.items || []).map((it, idx) => ({
      det_art: it.pdet_art,
      det_art_desc: it.art_desc || it.pdet_desc_larga || '',
      det_cant: Number(it.pdet_cant_ped),
      det_um_fac: it.pdet_um_ped || 'U',
      det_precio_mon: Number(it.pdet_precio),
      det_porc_dto: Number(it.pdet_porc_dcto) || 0,
      det_cod_iva: 2,  // default IVA 10%, usuario puede ajustar
      det_clave_ped: pedido.ped_clave,
      det_nro_item_ped: it.pdet_nro_item || idx + 1,
    })),
  };
};

const convertirAVenta = async (id) => {
  const pedido = await getById(id);
  if (pedido.ped_tipo === 'V') throw { status: 400, message: 'Ya es un pedido de venta' };
  await pool.query('UPDATE fac_pedido SET "PED_TIPO" = $1 WHERE "PED_CLAVE" = $2', ['V', id]);
  return getById(id);
};

const copiar = async (id, tipoDestino, login = 'SISTEMA') => {
  const origen = await getById(id);
  const data = {
    ped_tipo: tipoDestino || origen.ped_tipo,
    ped_fecha: new Date().toISOString().split('T')[0],
    ped_cli: origen.ped_cli,
    ped_contacto: origen.ped_contacto,
    ped_tel: origen.ped_tel,
    ped_ruc: origen.ped_ruc,
    ped_campanha: origen.ped_campanha,
    ped_vendedor: origen.ped_vendedor,
    ped_cond_venta: origen.ped_cond_venta,
    ped_producto: origen.ped_producto,
    ped_concepto: origen.ped_concepto,
    ped_obs: origen.ped_obs,
    ped_mon: origen.ped_mon,
    ped_dep: origen.ped_dep,
    ped_ind_prd: origen.ped_ind_prd,
    ped_tipo_fac: origen.ped_tipo_fac,
    ped_ind_req_rem: origen.ped_ind_req_rem,
    ped_ind_gar_fun: origen.ped_ind_gar_fun,
    ped_dias_validez: origen.ped_dias_validez,
    ped_tiempo_realiz: origen.ped_tiempo_realiz,
    ped_tasa_us: origen.ped_tasa_us,
    ped_cli_porc_ex: origen.ped_cli_porc_ex,
    ped_cli_nom: origen.ped_cli_nom,
    ped_cli_dir: origen.ped_cli_dir,
    ped_cli_tel: origen.ped_cli_tel,
    ped_cli_ruc: origen.ped_cli_ruc,
    ped_porc_dto: origen.ped_porc_dto,
    ped_porc_rgo: origen.ped_porc_rgo,
    ped_list_precio: origen.ped_list_precio,
    ped_estado: 'P',
    items: (origen.items || []).map((it) => ({
      pdet_art: it.pdet_art,
      pdet_um_ped: it.pdet_um_ped,
      pdet_cant_ped: it.pdet_cant_ped,
      pdet_precio: it.pdet_precio,
      pdet_porc_dcto: it.pdet_porc_dcto,
      pdet_desc_larga: it.pdet_desc_larga,
      pdet_calid_imp: it.pdet_calid_imp,
      pdet_ind_med: it.pdet_ind_med,
      pdet_ind_imp_dig: it.pdet_ind_imp_dig,
      pdet_tipo_ot: it.pdet_tipo_ot,
      pdet_tipo_prod: it.pdet_tipo_prod,
      pdet_resolucion: it.pdet_resolucion,
      pdet_nro_lados_imp: it.pdet_nro_lados_imp,
      pdet_ind_pru_color: it.pdet_ind_pru_color,
      pdet_ind_disenho: it.pdet_ind_disenho,
      pdet_med_base: it.pdet_med_base,
      pdet_med_alto: it.pdet_med_alto,
      pdet_med_total: it.pdet_med_total,
      pdet_med_base_t: it.pdet_med_base_t,
      pdet_med_alto_t: it.pdet_med_alto_t,
      pdet_med_total_t: it.pdet_med_total_t,
      pdet_costo_ar: it.pdet_costo_ar,
      pdet_costo_tot: it.pdet_costo_tot,
      pdet_precio_lista: it.pdet_precio_lista,
      pdet_duracion: it.pdet_duracion,
      pdet_fec_ini_cont: it.pdet_fec_ini_cont,
      pdet_fec_fin_cont: it.pdet_fec_fin_cont,
      pdet_cod_impu: it.pdet_cod_impu,
      pdet_obs: it.pdet_obs,
      pdet_contenido: it.pdet_contenido,
      pdet_art_bonif: it.pdet_art_bonif,
    })),
  };
  return create(data, login);
};

const aprobar = async (id, login = 'SISTEMA') => {
  const hoy = new Date().toISOString().split('T')[0];
  await pool.query(
    `UPDATE fac_pedido SET "PED_ESTADO" = 'A', "PED_APROBADO" = $1, "PED_FEC_ESTADO" = $2, "PED_LOGIN_ESTADO" = $3
     WHERE "PED_CLAVE" = $4`,
    [login, hoy, login, id]
  );
  return getById(id);
};

const rechazar = async (id, motivo, login = 'SISTEMA') => {
  const hoy = new Date().toISOString().split('T')[0];
  await pool.query(
    `UPDATE fac_pedido SET "PED_ESTADO" = 'C', "PED_OBS_RECHAZO" = $1, "PED_FEC_RECHAZO" = $2, "PED_USER_RECHAZO" = $3,
     "PED_FEC_ESTADO" = $2, "PED_LOGIN_ESTADO" = $3
     WHERE "PED_CLAVE" = $4`,
    [motivo || null, hoy, login, id]
  );
  return getById(id);
};

module.exports = { getAll, getById, create, update, remove, getArticulos, getParaFacturar, convertirAVenta, copiar, aprobar, rechazar };
