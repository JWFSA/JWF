import { Paginated } from './gen';
export type { Paginated };

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
