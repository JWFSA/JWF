import { Paginated } from './gen';
export type { Paginated };

export interface Agencia {
  agen_codigo: number;
  agen_desc: string;
  agen_est: string | null;
}

export interface Barrio {
  ba_codigo: number;
  ba_desc: string;
  ba_localidad: number | null;
  loc_desc?: string;
  loc_distrito?: number | null;
  dist_desc?: string;
}

export interface Zona {
  zona_codigo: number;
  zona_desc: string;
}

export interface Categoria {
  fcat_codigo: number;
  fcat_desc: string;
  fcat_mon: number | null;
  fcat_vent_ini: number;
  fcat_vent_fin: number;
  fcat_atraso: number;
}

export interface Condicion {
  con_desc: string;
}

export interface Vendedor {
  vend_legajo: number;
  vend_oper: number;
  oper_nombre?: string;
  oper_apellido?: string;
  vend_zona: number | null;
  zona_desc?: string;
  vend_empr: number | null;
  empr_razon_social?: string;
  vend_porc_comision_vta: number;
}

export interface Cliente {
  cli_codigo: number;
  cli_nom: string;
  cli_ruc: string | null;
  cli_tel: string | null;
  cli_fax: string | null;
  cli_email: string | null;
  cli_email2: string | null;
  cli_email3: string | null;
  cli_email4: string | null;
  cli_dir2: string | null;
  cli_localidad: string | null;
  cli_distrito: number | null;
  dist_desc?: string;
  cli_cod_localidad: number | null;
  loc_desc?: string;
  cli_cod_barrio: number | null;
  barr_desc?: string;
  cli_zona: number | null;
  zona_desc?: string;
  cli_categ: number | null;
  fcat_desc?: string;
  cli_pais: number | null;
  pais_desc?: string;
  cli_mon: number | null;
  mon_desc?: string;
  cli_est_cli: 'A' | 'I';
  cli_imp_lim_cr: number;
  cli_bloq_lim_cr: 'S' | 'N';
  cli_max_dias_atraso: number;
  cli_ind_potencial: 'S' | 'N';
  cli_obs: string | null;
  cli_pers_contacto: string | null;
  cli_vendedor: number | null;
  vend_nombre?: string;
  vend_apellido?: string;
  cli_tipo_vta: string | null;
  cli_mod_venta: string | null;
  cli_fec_aniv: string | null;
  cli_agencia: number | null;
  agen_desc?: string;
  cli_comision_agen: number | null;
  cli_cond_venta: string | null;
  cli_nom_fantasia: string | null;
  cli_pers_representante: string | null;
  cli_doc_ident_representante: string | null;
  cli_ind_exen: 'S' | 'N' | null;
}

export interface Articulo {
  art_codigo: number;
  art_desc: string;
  art_unid_med: string;
  art_codigo_fabrica: string | null;
}

export interface PedidoDet {
  pdet_clave_ped?: number;
  pdet_nro_item?: number;
  pdet_art: number;
  art_desc?: string;
  art_unid_med?: string;
  pdet_um_ped: string;
  pdet_um_art?: string | null;
  pdet_tipo_f?: string | null;
  pdet_factor?: number | null;
  pdet_cant_ped: number;
  pdet_precio: number;
  pdet_porc_dcto: number;
  pdet_imp_dcto_det?: number | null;
  pdet_imp_neto_det?: number;
  pdet_cant_um_art?: number | null;
  pdet_precio_um_art?: number | null;
  pdet_imp_neto_final?: number | null;
  pdet_desc_larga?: string | null;
  // Producción
  pdet_calid_imp?: number | null;
  pdet_ind_med?: string | null;
  pdet_ind_imp_dig?: string | null;
  pdet_tipo_ot?: number | null;
  pdet_tipo_prod?: string | null;
  pdet_resolucion?: string | null;
  pdet_nro_lados_imp?: number | null;
  pdet_ind_pru_color?: string | null;
  pdet_ind_disenho?: string | null;
  // Dimensiones
  pdet_med_base?: number | null;
  pdet_med_alto?: number | null;
  pdet_med_total?: number | null;
  pdet_med_base_t?: number | null;
  pdet_med_alto_t?: number | null;
  pdet_med_total_t?: number | null;
  // Costos
  pdet_costo_ar?: number | null;
  pdet_costo_tot?: number | null;
  pdet_precio_lista?: number | null;
  pdet_list_precio?: number | null;
  pdet_lista_precio?: number | null;
  // Cantidades
  pdet_cant_prod?: number | null;
  pdet_contenido?: number | null;
  pdet_cant_fraccion?: number | null;
  pdet_cant_caja?: number | null;
  pdet_cant?: number | null;
  // Facturación
  pdet_cant_fact?: number | null;
  pdet_cant_fact_um_ar?: number | null;
  pdet_cant_doc_fa?: number | null;
  pdet_cant_doc_nc?: number | null;
  pdet_imp_factu?: number | null;
  pdet_imp_neto_mon?: number | null;
  pdet_iva_mon?: number | null;
  pdet_cod_impu?: number | null;
  pdet_total_mon?: number | null;
  pdet_imp_tot_net_gs?: number | null;
  pdet_imp_tot_net_us?: number | null;
  pdet_imp_iva_gs?: number | null;
  pdet_imp_iva_us?: number | null;
  // Descuentos
  pdet_imp_dcto_cab?: number | null;
  pdet_imp_dcto_cab_ap?: number | null;
  pdet_imp_dctod_aplic?: number | null;
  pdet_porc_dto?: number | null;
  pdet_ind_dto_autorizado?: string | null;
  pdet_dto_login?: string | null;
  pdet_ind_modif_det_autorizado?: string | null;
  pdet_modif_det_login?: string | null;
  // Conversión
  pdet_art_factor_conversion?: number | null;
  pdet_art_bonif?: string | null;
  pdet_codigo_barra?: string | null;
  // Contratos / Fechas
  pdet_fec_ini_cont?: string | null;
  pdet_fec_fin_cont?: string | null;
  pdet_duracion?: number | null;
  pdet_segundos?: number | null;
  pdet_inserciones?: number | null;
  pdet_tot_seg_dia?: number | null;
  // Referencias
  pdet_clave_co?: number | null;
  pdet_nro_item_co?: number | null;
  pdet_clave_ped_ini?: number | null;
  pdet_nro_item_p_ini?: number | null;
  pdet_clave_pedido?: number | null;
  pdet_clave_pro?: number | null;
  pdet_item_pro?: number | null;
  pdet_cod_inser?: number | null;
  pdet_prov?: number | null;
  // Indicadores
  pdet_ind_terc?: string | null;
  pdet_ind_pre_det?: string | null;
  pdet_ind_stk?: string | null;
  pdet_ind_aut?: string | null;
  pdet_ind_vc?: string | null;
  // Observación
  pdet_obs?: string | null;
  // Migración
  pdet_clave_migra?: number | null;
}

export interface Pedido {
  ped_clave: number;
  ped_nro: number;
  ped_fecha: string;
  ped_empr?: number;
  ped_suc?: number;
  ped_tipo?: string;
  ped_ind_prd?: string | null;
  ped_estado: string;
  ped_mon?: number | null;
  mon_desc?: string;
  ped_cli: number;
  cli_nom?: string;
  cli_ruc?: string;
  ped_contacto?: string | null;
  ped_tel?: string | null;
  ped_ruc?: string | null;
  ped_campanha?: number | null;
  ped_vendedor?: number | null;
  vend_nombre?: string;
  vend_apellido?: string;
  ped_cond_venta?: string | null;
  ped_producto?: string | null;
  ped_concepto?: string | null;
  ped_obs?: string | null;
  ped_nro_orco?: number | null;
  ped_fec_orco?: string | null;
  ped_fec_entreg_req?: string | null;
  ped_fec_entreg_prd?: string | null;
  ped_tipo_fac?: string | null;
  ped_dep?: number | null;
  ped_ind_fab_adel?: string | null;
  ped_ind_hab_fac?: string | null;
  ped_fto_imp?: number | null;
  ped_imp_dcto_mon?: number;
  ped_imp_total_mon?: number;
  ped_ind_req_rem?: string | null;
  ped_dias_validez?: number | null;
  ped_tiempo_realiz?: string | null;
  ped_ind_gar_fun?: string | null;
  ped_imp_facturado?: number | null;
  ped_imp_dcto_aplic?: number | null;
  ped_nro_ant?: number | null;
  ped_cli_porc_ex?: number | null;
  ped_fec_cierre?: string | null;
  ped_tasa_us?: number | null;
  ped_ruta_contrato?: string | null;
  ped_cli_obs?: string | null;
  ped_ind_fac?: string | null;
  ped_cli_nom?: string | null;
  ped_cli_dir?: string | null;
  ped_cli_tel?: string | null;
  ped_cli_ruc?: string | null;
  ped_fec_envio?: string | null;
  ped_aprobado?: string | null;
  ped_list_precio?: number | null;
  ped_plan_finan?: number | null;
  ped_tipo_factura?: number | null;
  ped_doc_clave?: number | null;
  ped_operador?: number | null;
  ped_tipo_deposito?: string | null;
  ped_porc_dto?: number | null;
  ped_porc_rgo?: number | null;
  ped_fech_auto?: string | null;
  ped_login_auto?: string | null;
  ped_fec_estado?: string | null;
  ped_login_estado?: string | null;
  ped_cli_suc?: number | null;
  ped_nro_ot?: string | null;
  ped_forma_pago?: number | null;
  ped_ind_estado?: string | null;
  ped_ind_tipo?: string | null;
  ped_fec_pedido?: string | null;
  ped_obs_rechazo?: string | null;
  ped_fec_rechazo?: string | null;
  ped_user_rechazo?: string | null;
  ped_clave_proyecto?: number | null;
  ped_clave_padre?: number | null;
  ped_nro_proyecto?: number | null;
  ped_procesado?: string | null;
  ped_clave_migra?: number | null;
  ped_ind_canje?: string | null;
  ped_login?: string;
  ped_fec_grab?: string;
  items?: PedidoDet[];
  ordenes_trabajo?: {
    ot_clave: number;
    ot_nro: number;
    ot_serie: string | null;
    ot_desc: string | null;
    ot_situacion: number | null;
    ot_nro_item_ped: number | null;
    ot_fec_emis: string | null;
    tipo_desc: string | null;
  }[];
}

export interface ListaPrecio {
  lipe_empr?: number;
  lipe_nro_lista_precio: number;
  lipe_mon?: number | null;
  lipe_desc: string;
  lipe_estado: 'A' | 'I';
}

export interface ListaPrecioDetalle {
  lipr_nro_lista_precio: number;
  lipr_art: number;
  art_desc: string;
  art_unid_med: string | null;
  lipr_precio_unitario: number;
  lipr_dcto: number;
  lipr_dctob: number;
}

export interface FacturaDet {
  det_clave_doc?: number;
  det_nro_item?: number;
  det_art: number | null;
  det_art_desc: string;
  det_cant: number;
  det_um_fac: string;
  det_precio_mon: number;   // precio CON IVA incluido
  det_porc_dto: number;
  det_neto_loc: number;     // base imponible (sin IVA)
  det_iva_loc: number;      // monto IVA
  det_cod_iva: number;      // 1=exento, 2=10%, 3=5%
  det_clave_ped?: number | null;
  det_nro_item_ped?: number | null;
}

/** Datos de pedido transformados para pre-llenar el formulario de factura */
export interface PedidoParaFacturar {
  ped_clave: number;
  doc_fec_doc: string;
  doc_cli: number;
  cli_nom: string;
  doc_cli_nom: string;
  doc_cli_ruc: string | null;
  doc_cond_vta: number | null;
  doc_mon: number;
  doc_obs: string | null;
  items: FacturaDet[];
}

export interface Factura {
  doc_clave: number;
  doc_nro_doc: number;
  doc_nro_timbrado: string | null;
  doc_serie: string | null;
  doc_fec_doc: string;
  doc_cli: number | null;
  cli_nom: string | null;
  doc_cli_nom: string | null;
  doc_cli_ruc: string | null;
  doc_cond_vta: number | null;
  doc_mon: number | null;
  mon_desc?: string;
  mon_simbolo?: string;
  doc_obs: string | null;
  doc_grav_10_loc: number;
  doc_grav_5_loc: number;
  doc_neto_exen_loc: number;
  doc_iva_10_loc: number;
  doc_iva_5_loc: number;
  doc_saldo_loc: number;
  doc_tipo_mov: number;
  items?: FacturaDet[];
}

export interface Campanha {
  camp_cli: number;
  cli_nom?: string;
  camp_nro: number;
  camp_nombre: string;
  camp_ind_vigente: string | null;
}

export interface ComisionFac {
  com_clave: number;
  com_nro: number;
  com_fec_emis: string | null;
  com_art: number | null;
  com_art_desc: string | null;
  com_art_alfa: string | null;
  com_clas: number | null;
  com_clas_desc: string | null;
  com_dificultad: string | null;
  com_pauta_full: number | null;
  com_porc_base_dir: number | null;
  com_porc_base_age: number | null;
  com_porc_sup_dir: number | null;
  com_porc_sup_age: number | null;
  com_estado: string | null;
}

export interface SolicitudDescuento {
  sod_clave: number;
  sod_nro: number;
  sod_clave_ped: number | null;
  sod_fecha_sol: string;
  sod_fec_grab?: string;
  sod_login_sol: string | null;
  cant_items?: number;
  detalle?: SolicitudDescuentoDet[];
}

export interface SolicitudDescuentoDet {
  sode_clave: number;
  sode_item: number;
  sode_art: number | null;
  art_desc?: string;
  sode_dcto_sol: number | null;
  sode_dcto_aprob: number | null;
  sode_estado: string | null;
  sode_fec_est: string | null;
  sode_user_est: string | null;
  sode_imp_sol: number | null;
  sode_imp_aprob: number | null;
  sode_imp_neto_ant: number | null;
  sode_imp_neto_final: number | null;
}

export interface ReporteDescuentoVendedor {
  vendedor: string;
  solicitudes: number;
  items: number;
  total_neto_anterior: number;
  total_descuento_solicitado: number;
  total_descuento_aprobado: number;
  total_descuento_rechazado: number;
  total_descuento_pendiente: number;
  total_neto_final: number;
}

export interface ReporteDescuentoDetalle {
  sod_clave: number;
  sod_nro: number;
  sod_fecha_sol: string;
  vendedor: string;
  ped_nro: number | null;
  cliente: string | null;
  items: number;
  total_neto_anterior: number;
  total_descuento_solicitado: number;
  total_descuento_aprobado: number;
  total_neto_final: number;
}

export interface ReporteDescuentos {
  totales: {
    solicitudes: number;
    items: number;
    total_neto_anterior: number;
    total_descuento_solicitado: number;
    total_descuento_aprobado: number;
    total_descuento_rechazado: number;
    total_descuento_pendiente: number;
    total_neto_final: number;
  };
  porVendedor: ReporteDescuentoVendedor[];
  detalle: ReporteDescuentoDetalle[];
}
