import { Paginated } from './gen';
export type { Paginated };

export interface GrupoCuenta {
  GRUP_CODIGO: number;
  GRUP_DESC: string;
  GRUP_SALDO_NORMAL: string;
}

export interface RubroCuenta {
  RUB_CODIGO: number;
  RUB_DESC: string;
}

export interface CentroCosto {
  CCO_CODIGO: number;
  CCO_DESC: string;
}

export interface Ejercicio {
  ej_empr: number;
  ej_codigo: number;
  ej_fec_inicial: string;
  ej_fec_final: string;
  ej_utilidad: number | null;
}

export interface Cuenta {
  ctac_clave: number;
  ctac_empr?: number;
  ctac_nro: string;
  ctac_desc: string;
  ctac_nivel: number | null;
  ctac_rubro: number | null;
  rubro_desc?: string;
  ctac_ccosto: number | null;
  ccosto_desc?: string;
  ctac_grupo: number | null;
  grupo_desc?: string;
  ctac_ind_imputable: string | null;
  ctac_clave_padre: number | null;
  ctac_ind_mov_var: string | null;
  ctac_lineas?: number | null;
}

export interface Asiento {
  asi_clave: number;
  asi_empr?: number;
  asi_ejercicio: number;
  asi_nro: number;
  asi_fec: string;
  asi_obs: string | null;
  asi_login?: string | null;
  asi_fec_grab?: string | null;
  asi_sist?: string | null;
  detalle?: AsientoDet[];
}

export interface AsientoDet {
  asid_clave_asi?: number;
  asid_item?: number;
  asid_clave_ctaco: number | null;
  ctac_nro?: string;
  ctac_desc?: string;
  asid_ind_db_cr: string;
  asid_importe: number;
  asid_tipo_mov: string | null;
  asid_nro_doc: string | null;
  asid_desc: string | null;
  asid_concepto: string | null;
  asid_ccosto: number | null;
}
