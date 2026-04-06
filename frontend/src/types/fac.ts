import { Paginated } from './gen';
export type { Paginated };

export interface Barrio {
  ba_codigo: number;
  ba_desc: string;
  ba_localidad: number | null;
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
  cli_dir2: string | null;
  cli_localidad: string | null;
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
  pdet_cant_ped: number;
  pdet_precio: number;
  pdet_porc_dcto: number;
  pdet_imp_neto_det?: number;
  pdet_desc_larga?: string | null;
}

export interface Pedido {
  ped_clave: number;
  ped_nro: number;
  ped_fecha: string;
  ped_empr?: number;
  ped_suc?: number;
  ped_tipo?: string;
  ped_estado: string;
  ped_mon?: number | null;
  mon_desc?: string;
  ped_cli: number;
  cli_nom?: string;
  cli_ruc?: string;
  ped_vendedor?: number | null;
  vend_nombre?: string;
  vend_apellido?: string;
  ped_cond_venta?: string | null;
  ped_producto?: string | null;
  ped_concepto?: string | null;
  ped_obs?: string | null;
  ped_imp_total_mon?: number;
  ped_imp_dcto_mon?: number;
  ped_login?: string;
  ped_fec_grab?: string;
  items?: PedidoDet[];
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
