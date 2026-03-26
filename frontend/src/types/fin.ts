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
