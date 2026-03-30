import { Paginated } from './gen';
export type { Paginated };

export interface Banco {
  bco_codigo: number;
  bco_desc: string;
  bco_pais: number | null;
}

export interface FormaPago {
  fpag_codigo: number;
  fpag_desc: string;
  fpag_dia_pago: number | null;
  fpag_ind_fact: string | null;
}

export interface Ramo {
  ramo_codigo: number;
  ramo_desc: string;
  ramo_padre: number | null;
}

export interface TipoProveedor {
  tipr_codigo: number;
  tipr_desc: string;
}

export interface Personeria {
  pers_codigo: number;
  pers_desc: string;
}

export interface ClaseDoc {
  cldo_codigo: number;
  cldo_desc: string;
}

export interface CuentaBancaria {
  cta_empr?: number;
  cta_codigo: number;
  cta_desc: string;
  cta_bco: number | null;
  bco_desc?: string;
  cta_tipo_cta: string | null;
  cta_mon: number | null;
  mon_desc?: string;
  cta_fec_habilit: string | null;
}

export interface OrdenPago {
  ordp_clave: number;
  ordp_codigo: number;
  ordp_empr?: number;
  ordp_suc?: number;
  ordp_fec_orden: string;
  ordp_beneficiario: string | null;
  ordp_prov: number | null;
  prov_nom?: string;
  ordp_cta_bco: number | null;
  cta_desc?: string;
  ordp_nro_cta_banc: string | null;
  ordp_fcon_codigo: number | null;
  fcon_desc?: string;
  ordp_mon: number | null;
  mon_desc?: string;
  ordp_cheq_nro: string | null;
  ordp_cheq_fec: string | null;
  ordp_cheq_importe: number | null;
  ordp_tot_pago: number | null;
  ordp_porc_dcto: number | null;
  ordp_tot_dcto: number | null;
  ordp_estado: string | null;
  ordp_obs: string | null;
}

export interface Proveedor {
  prov_codigo: number;
  prov_razon_social: string;
  prov_propietario: string | null;
  prov_ruc: string | null;
  prov_tel: string | null;
  prov_fax: string | null;
  prov_celular: string | null;
  prov_email: string | null;
  prov_dir2: string | null;
  prov_pais: number | null;
  pais_desc?: string;
  prov_tipo: number | null;
  tipr_desc?: string;
  prov_est_prov: 'A' | 'I';
  prov_plazo_pago: string | null;
  prov_pers_contacto: string | null;
  prov_pers_contacto2: string | null;
  prov_obs: string | null;
  prov_tributo_unico: 'S' | 'N';
  prov_retencion: 'S' | 'N';
}

export interface ConceptoFin {
  fcon_clave: number;
  fcon_empr?: number;
  fcon_codigo: number;
  fcon_desc: string;
  fcon_tipo_saldo: string | null;
  fcon_clave_ctaco: number | null;
  fcon_resum_libro_caja: string | null;
  fcon_ind_dcto_com: string | null;
  fcon_ccosto: number | null;
}

export interface DocumentoFin {
  doc_clave: number;
  doc_empr?: number;
  doc_suc?: number;
  doc_tipo_mov: number | null;
  tmov_desc?: string;
  doc_nro_doc: number | null;
  doc_serie?: string | null;
  doc_tipo_saldo: string | null;
  doc_fec_doc: string;
  doc_fec_oper: string;
  doc_prov: number | null;
  prov_nom?: string;
  doc_cli: number | null;
  doc_cli_nom: string | null;
  doc_cli_ruc?: string | null;
  doc_mon: number | null;
  mon_desc?: string;
  doc_tasa?: number | null;
  doc_neto_exen_loc?: number | null;
  doc_neto_exen_mon: number | null;
  doc_neto_grav_loc?: number | null;
  doc_neto_grav_mon: number | null;
  doc_iva_loc?: number | null;
  doc_iva_mon: number | null;
  doc_saldo_loc: number | null;
  doc_saldo_mon: number | null;
  doc_obs: string | null;
  doc_cond_vta?: number | null;
  doc_nro_timbrado?: string | null;
  doc_login?: string | null;
  doc_fec_grab?: string | null;
  conceptos?: DocConcepto[];
  cuotas?: DocCuota[];
}

export interface DocConcepto {
  dcon_clave_doc: number;
  dcon_item: number;
  dcon_clave_concepto: number | null;
  concepto_desc?: string;
  dcon_tipo_saldo: string | null;
  dcon_exen_loc: number | null;
  dcon_exen_mon: number | null;
  dcon_grav_loc: number | null;
  dcon_grav_mon: number | null;
  dcon_iva_loc: number | null;
  dcon_iva_mon: number | null;
  dcon_porc_iva: number | null;
}

export interface DocCuota {
  cuo_clave_doc: number;
  cuo_fec_vto: string;
  cuo_imp_loc: number | null;
  cuo_imp_mon: number | null;
  cuo_saldo_loc: number | null;
  cuo_saldo_mon: number | null;
}

export interface Cheque {
  cheq_clave: number;
  cheq_empr?: number;
  cheq_serie: string | null;
  cheq_nro: string | null;
  cheq_suc?: number | null;
  cheq_bco: number | null;
  bco_desc?: string;
  cheq_mon: number | null;
  mon_desc?: string;
  cheq_cli: number | null;
  cheq_cli_nom: string | null;
  cheq_titular: string | null;
  cheq_orden: string | null;
  cheq_fec_emis: string;
  cheq_fec_depositar: string;
  cheq_importe: number | null;
  cheq_importe_loc: number | null;
  cheq_situacion: string | null;
  cheq_obs: string | null;
  cheq_nro_cta_cheq?: string | null;
  cheq_fec_grab?: string | null;
  cheq_login?: string | null;
}
