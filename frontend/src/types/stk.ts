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
