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
  empr_ruc: string | null;
  empr_localidad: string | null;
  empr_correo_elect: string | null;
  empr_pagina_web: string | null;
  empr_ind_bloqueado: 'S' | 'N' | null;
}

export interface Sucursal {
  suc_codigo: number;
  suc_desc: string;
  suc_dir: string | null;
  suc_tel: string | null;
  suc_localidad: string | null;
  suc_ind_casa_central: 'S' | 'N' | null;
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
