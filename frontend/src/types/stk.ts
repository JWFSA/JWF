import { Paginated } from './gen';

export type { Paginated };

export interface Articulo {
  art_codigo: number;
  art_desc: string;
  art_desc_abrev: string | null;
  art_unid_med: string | null;
  art_linea: number | null;
  lin_desc?: string;
  art_marca: number | null;
  marc_desc?: string;
  art_rubro: number | null;
  rub_desc?: string;
  art_grupo: number | null;
  art_est: 'A' | 'I';
  art_codigo_fabrica: string | null;
  art_tipo?: number;
  art_impu: number | null;
  art_ind_imp: string | null;
  art_tipo_comision: string | null;
  art_ind_venta: string | null;
  art_cod_alfanumerico: string | null;
  art_factor_conversion: number | null;
  art_clasificacion: number | null;
  clas_desc?: string;
  art_pais: number | null;
  pais_desc?: string;
  art_prov: number | null;
  prov_razon_social?: string;
  art_empaque: string | null;
  art_contenido: number | null;
  art_datos_tec: string | null;
  art_color: string | null;
  art_med_base: number | null;
  art_med_alto: number | null;
  art_med_total: number | null;
  art_max_porc_dcto_vta: number | null;
  art_kg_unid: number | null;
  art_porc_aum_costo: number | null;
}

export interface Deposito {
  dep_empr: number;
  dep_suc: number;
  dep_codigo: number;
  dep_desc: string;
}

export interface Linea {
  lin_codigo: number;
  lin_desc: string;
}

export interface Marca {
  marc_codigo: number;
  marc_desc: string;
}

export interface Rubro {
  rub_codigo: number;
  rub_desc: string;
  rub_ind_incluir_ranking?: string;
}

export interface UnidadMedida {
  um_codigo: string;
}

export interface Grupo {
  grup_linea: number;
  grup_codigo: number;
  grup_desc: string;
  grup_coeficiente: number;
  lin_desc?: string;
}

export interface StockActual {
  arde_empr: number;
  arde_suc: number;
  arde_dep: number;
  arde_art: number;
  art_desc: string;
  art_codigo_fabrica: string | null;
  art_unid_med: string | null;
  dep_desc: string;
  arde_cant_act: number;
  arde_cant_ent: number;
  arde_cant_sal: number;
  arde_ubic: string | null;
}

export interface Operacion {
  oper_codigo: number;
  oper_desc: string;
  oper_ent_sal: 'E' | 'S';
  oper_ind_costo_valor: string;
}

export interface MovimientoDetalle {
  deta_clave_doc: number;
  deta_nro_item: number;
  deta_art: number;
  art_desc?: string;
  art_unid_med?: string | null;
  deta_cant: number;
}

export interface RemisionDetalle {
  detr_nro_item: number;
  detr_art: number;
  art_desc?: string;
  art_unid_med?: string | null;
  detr_cant_rem: number;
}

export interface Remision {
  rem_nro: number;
  rem_empr?: number;
  rem_fec_emis: string;
  rem_fec_grab?: string;
  rem_cli?: number | null;
  cli_nom?: string;
  rem_cli_nom?: string | null;
  rem_dep?: number | null;
  dep_desc?: string;
  rem_dep_dest?: number | null;
  dep_dest_desc?: string;
  rem_obs?: string | null;
  rem_nro_timbrado?: string | null;
  rem_clave_doc?: number | null;
  items?: RemisionDetalle[];
}

/** Datos de factura transformados para pre-llenar el formulario de remisión */
export interface FacturaParaRemitir {
  rem_clave_doc: number;
  rem_fec_emis: string;
  rem_cli: number | null;
  cli_nom: string | null;
  rem_cli_nom: string | null;
  items: RemisionDetalle[];
}

export interface Movimiento {
  docu_clave: number;
  docu_empr?: number;
  docu_nro_doc: number;
  docu_fec_emis: string;
  docu_fec_grab?: string;
  docu_tipo_mov?: number | null;
  oper_desc?: string;
  oper_ent_sal?: string;
  docu_dep_orig?: number | null;
  dep_orig_desc?: string;
  docu_dep_dest?: number | null;
  dep_dest_desc?: string;
  docu_obs?: string | null;
  items?: MovimientoDetalle[];
}

export interface Clasificacion {
  clas_codigo: number;
  clas_desc: string;
  clas_padre: number | null;
}

export interface Chofer {
  chof_codigo: number;
  chof_nombre: string;
  chof_cedula: number | null;
  chof_direccion: string | null;
  chof_veh_marca: string | null;
  chof_veh_chapa: string | null;
}

export interface OcupacionEspacio {
  res_cod_reserva: number;
  res_cod_art: number;
  art_desc: string;
  res_cod_alfa?: string | null;
  res_fec_desde: string | null;
  res_fec_hasta: string | null;
  res_precio: number | null;
  res_estado: string;
  res_grupo: number | null;
  res_linea: number | null;
  res_grupo_desc: string | null;
  res_cant: number | null;
  res_um: string | null;
  res_cant_dias: number | null;
  res_segundos: number | null;
  res_inserciones: number | null;
  res_cod_ins: number | null;
  res_tot_seg: number | null;
  res_ped_clave: number | null;
  res_nro_ped: number | null;
  res_item_ped: number | null;
  res_est_it: string | null;
  res_fec_est_it: string | null;
  res_obs_it: string | null;
  cli_nom: string | null;
}

export interface Insercion {
  ins_codigo: number;
  ins_desc: string;
  ins_seg: number;
  ins_inserciones: number;
  ins_total: number;
}

export interface Cotizacion {
  cot_fec: string;
  cot_mon: number;
  mon_desc?: string;
  mon_simbolo?: string;
  cot_tasa: number;
  cot_tasa_com?: number | null;
  cot_tasa_vta_cnt?: number | null;
  cot_tasa_com_cnt?: number | null;
}
