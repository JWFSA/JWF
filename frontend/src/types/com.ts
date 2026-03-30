import { Paginated } from './gen';
export type { Paginated };

export interface OrdenCompra {
  orcom_nro: number;
  orcom_fec_emis: string;
  orcom_prov: number | null;
  prov_nom?: string;
  orcom_dpto_solicita: number | null;
  orcom_responsable: number | null;
  orcom_cliente: string | null;
  orcom_mon: number | null;
  mon_desc?: string;
  orcom_tasa: number | null;
  orcom_total: number | null;
  orcom_estado: string | null;
  orcom_login_estado?: string | null;
  orcom_fec_estado?: string | null;
  orcom_obs: string | null;
  orcom_login?: string | null;
  orcom_fec_grab?: string | null;
  orcom_forma_pago: string | null;
  orcom_fec_vto: string | null;
  orcom_procesado: string | null;
  detalle?: OrdenCompraDet[];
}

export interface OrdenCompraDet {
  orcomdet_nro?: number;
  orcomdet_item?: number;
  orcomdet_tipo_mov: string | null;
  orcomdet_art: number | null;
  orcomdet_art_desc: string | null;
  orcomdet_art_unid_med: string | null;
  orcomdet_cant: number;
  orcomdet_precio_unit: number;
  orcomdet_impu_codigo: number | null;
  orcomdet_exenta: number;
  orcomdet_gravada: number;
  orcomdet_impuesto: number;
  orcomdet_total: number;
  orcomdet_desc_larga: string | null;
}

export interface ContratoProv {
  cont_clave: number;
  cont_numero: number;
  cont_prov: number | null;
  prov_nom?: string;
  cont_fecha: string;
  cont_mon: number | null;
  mon_desc?: string;
  cont_imp_total: number | null;
  cont_ind_interno: string | null;
  cont_ind_anterior: string | null;
  cont_ind_vigente: string | null;
  cont_obs: string | null;
  cont_imp_factu: number | null;
  cont_imp_pend_f: number | null;
  detalle?: ContratoProvDet[];
}

export interface ContratoProvDet {
  cond_clave_cont?: number;
  cond_nro_item?: number;
  cond_local: number | null;
  cond_fec_ini: string | null;
  cond_fec_fin: string | null;
  cond_un_med: string | null;
  cond_cant: number;
  cond_precio: number;
  cond_imp_total: number;
  cond_imp_factu?: number;
}
