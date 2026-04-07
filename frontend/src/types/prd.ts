export interface TipoOT {
  tipo_codigo: number;
  tipo_desc: string;
}

export interface GastoOT {
  gast_clave_ot: number;
  gast_nro_item: number;
  gast_nro_doc: number | null;
  gast_prov_nom: string | null;
  gast_fec_emis: string;
  gast_detalle: string | null;
  gast_neto_loc: number;
  gast_neto_mon: number;
  gast_iva_mon: number | null;
  gast_iva_loc: number | null;
  gast_porc_utilidad: number | null;
  gast_importe_vta_mon: number | null;
  gast_importe_gasto_mon: number | null;
  gast_articulo: number | null;
  art_desc?: string;
  gast_cant_ar: number | null;
  gast_um_ar: string | null;
  gast_login: string | null;
  gast_codigo_oper: string | null;
}

export interface EventoOT {
  eot_clave: number;
  eot_fec_evento: string;
  eot_tipo_evento: string | null;
  eot_user: string | null;
  eot_desc_evento: string | null;
  eot_camp_afectado: string | null;
  eot_datos_old: string | null;
  eot_datos_new: string | null;
}

export interface OrdenTrabajo {
  ot_clave: number;
  ot_empr?: number;
  ot_suc?: number;
  ot_nro: number;
  ot_desc: string | null;
  ot_fec_emis: string;
  ot_mon: number | null;
  mon_desc?: string;
  ot_tipo: number | null;
  tipo_desc?: string;
  ot_cli: number | null;
  ot_cli_nom: string | null;
  cli_nom_full?: string;
  ot_cli_tel: string | null;
  ot_servicio: number | null;
  ot_situacion: number | null;
  ot_fec_ent: string | null;
  ot_fec_prev_term: string | null;
  ot_fec_liquidacion: string | null;
  ot_obs: string | null;
  ot_legajo: number | null;
  ot_nom_producto: string | null;
  ot_concepto: string | null;
  ot_marca: number | null;
  ot_desc_marca: string | null;
  ot_contacto: string | null;
  ot_cli_contacto: string | null;
  ot_clave_ped: number | null;
  ot_nro_item_ped: number | null;
  ot_ind_disenho: string | null;
  ot_ruta_disenho: string | null;
  ot_costo_mon: number | null;
  ot_costo_loc: number | null;
  ot_user: string | null;
  ot_cant_p: number | null;
  ot_um: string | null;
  ot_serie: string | null;
  ot_situacion_ant: number | null;
  ot_cant_horas: number | null;
  ot_unidad: number | null;
  ot_desc_unidad: string | null;
  ot_responsable: string | null;
  ot_clave_docu_fact: number | null;
  ot_item_docu_fact: number | null;
  ot_clave_fin: number | null;
  ot_nro_ot_ref: number | null;
  ot_clave_relacion: number | null;
  ot_nro_relacion: number | null;
  ot_cod_proveedor: number | null;
  ot_cuad_demo: number | null;
  ot_imp_presup_instalac: number | null;
  ot_imp_presup_equipos: number | null;
  ot_imp_lim_costo: number | null;
  ot_impu: number | null;
  ot_porc_reca_mat: number | null;
  ot_porc_util_mat: number | null;
  ot_porc_util_mat_imp: number | null;
  ot_porc_reca_mano_obra: number | null;
  ot_porc_util_mano_obra: number | null;
  ot_porc_reca_gast_var: number | null;
  ot_porc_util_gast_var: number | null;
  ot_est_disenho: number | null;
  ot_est_plan: number | null;
  ot_fec_ult_dis: string | null;
  ot_disenhador: number | null;
  ot_fec_prev_term_prd: string | null;
  ot_obs_retraso: string | null;
  ot_fec_lim_perm_oper: string | null;
  ot_ind_af_stock: string | null;
  ot_procesado: string | null;
  ot_motivo_desperfecto: string | null;
  ped_nro?: number | null;
  gastos?: GastoOT[];
  eventos?: EventoOT[];
}

export interface PedidoProduccionDet {
  ppdet_clave_det: number;
  ppdet_item: number;
  ppdet_art: number | null;
  art_desc?: string;
  ppdet_cant: number | null;
  ppdet_um: string | null;
  ppdet_medida: string | null;
  ppdet_desc_larga: string | null;
  ppdet_descripcion: string | null;
  ppdet_obs: string | null;
  ppdet_med_largo: number | null;
  ppdet_med_ancho: number | null;
  ppdet_med_alto: number | null;
  ppdet_fec_term: string | null;
  ppdet_fec_prev: string | null;
  ppdet_clave_ot: number | null;
  ppdet_ot: number | null;
}

export interface PedidoProduccion {
  pp_clave: number;
  pp_nro: number;
  pp_fec_emis: string | null;
  pp_cli: number | null;
  pp_cli_nom: string | null;
  pp_cli_tel: string | null;
  pp_cli_contacto: string | null;
  pp_cli_ruc: string | null;
  pp_cli_dir: string | null;
  pp_clave_ped: number | null;
  pp_nro_pedido: number | null;
  pp_fec_ent: string | null;
  pp_estado: string | null;
  pp_disenho: string | null;
  pp_obs: string | null;
  cant_items?: number;
  items?: PedidoProduccionDet[];
}
