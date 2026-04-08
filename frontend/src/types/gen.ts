export interface Operador {
  oper_codigo: number;
  oper_nombre: string;
  oper_apellido: string | null;
  oper_login: string;
  oper_email: string | null;
  oper_ind_admin: 'S' | 'N';
  oper_ind_desc: 'S' | 'N';
  oper_empr: number | null;
  empr_razon_social?: string;
  oper_suc: number | null;
  suc_desc?: string;
  roles?: Rol[];
}

export interface Rol {
  rol_codigo: number;
  rol_nombre: string;
  programas?: Programa[];
}

export interface Empresa {
  empr_codigo: number;
  empr_razon_social: string;
  empr_dir: string | null;
  empr_tel: string | null;
  empr_fax: string | null;
  empr_ruc: string | null;
  empr_localidad: string | null;
  empr_correo_elect: string | null;
  empr_pagina_web: string | null;
  empr_ind_bloqueado: 'S' | 'N' | null;
}

export interface Sucursal {
  suc_empr?: number;
  suc_codigo: number;
  suc_desc: string;
  suc_dir: string | null;
  suc_tel: string | null;
  suc_fax: string | null;
  suc_localidad: string | null;
  suc_ind_casa_central: 'S' | 'N' | null;
}

export interface Pais {
  pais_codigo: number;
  pais_desc: string;
  pais_nacionalidad: string | null;
}

export interface Departamento {
  dpto_codigo: number;
  dpto_desc: string;
}

export interface Seccion {
  secc_dpto: number;
  secc_codigo: number;
  secc_desc: string;
}

export interface Sistema {
  sist_codigo: number;
  sist_desc: string;
  sist_desc_abrev: string;
  sist_ind_habilitado: 'S' | 'N' | null;
}

export interface Programa {
  prog_clave: number;
  prog_desc: string;
  prog_sistema: number;
  sist_desc?: string;
}

export interface Moneda {
  mon_codigo: number;
  mon_desc: string;
  mon_simbolo: string;
  mon_tasa_vta: number;
  mon_tasa_comp: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Ciudad {
  ciudad_codigo: number;
  ciudad_desc: string;
}

export interface Impuesto {
  impu_codigo: number;
  impu_desc: string;
  impu_porcentaje: number;
  impu_incluido: 'S' | 'N';
  impu_porc_base_imponible: number;
  impu_cod_set: number;
}

export interface TipoImpuesto {
  timpu_codigo: number;
  timpu_desc: string;
  timpu_iva_n: 'S' | 'N';
  timpu_irp_rps_n: 'S' | 'N';
  timpu_ire_simple_n: 'S' | 'N';
  timpu_ind_imputa_exenta: 'S' | 'N';
  timpu_ind_imputa: 'S' | 'N';
}

export interface Profesion {
  prof_codigo: number;
  prof_desc: string;
}

export interface Distrito {
  dist_codigo: number;
  dist_desc: string;
  dist_pais: number | null;
  pais_desc?: string;
}

export interface MotivoAnulacion {
  moan_codigo: number;
  moan_desc: string;
}

export interface Localidad {
  loc_codigo: number;
  loc_desc: string;
  loc_dep_codigo: number | null;
  dpto_desc?: string;
  loc_distrito: number | null;
  dist_desc?: string;
}

export interface Barrio {
  barr_codigo: number;
  barr_desc: string;
  barr_codigo_loc: number | null;
  loc_desc?: string;
  barr_distrito: number | null;
  dist_desc?: string;
}

export interface AuthUser {
  codigo: number;
  nombre: string;
  login: string;
  email: string | null;
  isAdmin: boolean;
  empresa: number | null;
  sucursal: number | null;
  roles: number[];
}
