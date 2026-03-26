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
  art_est: 'A' | 'I';
  art_codigo_fabrica: string | null;
  art_tipo?: number;
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
  items?: RemisionDetalle[];
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
