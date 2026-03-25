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
