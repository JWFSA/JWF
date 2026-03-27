import { Paginated } from './gen';

export type { Paginated };

export interface Cargo {
  car_codigo: number;
  car_desc: string;
}

export interface Categoria {
  pcat_codigo: number;
  pcat_desc: string;
}

export interface Area {
  per_area_cod: number;
  per_area_desc: string;
}

export interface Seccion {
  per_secc_cod: number;
  per_secc_desc: string;
  per_secc_area?: number | null;
  per_secc_area_desc?: string | null;
}

export interface Turno {
  tur_codigo: number;
  tur_desc: string;
  tur_estado?: string | null;
}

export interface TipoContrato {
  tipcon_codigo: number;
  tipcon_descripcion: string;
  tipcon_ind_prueba: number;
}

export interface MotivoAusencia {
  maus_clave: number;
  maus_desc: string;
}

export interface FormaPago {
  forma_codigo: number;
  forma_desc: string;
  forma_tipo_pago: string | null;
}

export interface TipoLiquidacion {
  tipliq_codigo: number;
  tipliq_descripcion: string;
}

export interface TipoPago {
  tpag_codigo: number;
  tpag_desc: string;
}

export interface TipoFamiliar {
  tipo_codigo: number;
  tipo_desc: string;
  tipo_cobra_conc: string | null;
}

export interface Idioma {
  idi_codigo: number;
  idi_descripcion: string;
}

export interface Carrera {
  carr_codigo: number;
  carr_descripcion: string;
}

export interface Bachillerato {
  bach_codigo: number;
  bach_descripcion: string;
}

export interface Capacitacion {
  pcapac_codigo: number;
  pcapac_desc: string;
}

export interface NivelCapacitacion {
  pcapn_cod: number;
  pcapn_desc: string;
}

export interface EstadoEstudio {
  est_codigo: number;
  est_descripcion: string;
}

export interface Funcion {
  fun_codigo: number;
  fun_desc: string;
}

export interface ClasificacionDescuento {
  clde_codigo: number;
  clde_desc: string;
}

export interface TipoSalario {
  ptipo_sal_codigo: number;
  ptipo_sal_desc: string;
  ptipo_sal_dias_trab: number | null;
  ptipo_sal_tipo: string | null;
}

export interface MotivoLicencia {
  mlic_codigo: number;
  mlic_desc: string;
  mlic_tipo: string | null;
  mlic_cat_dias: number | null;
  mlic_ips: string | null;
  mlic_control_deficit: string | null;
}

export interface InstEducativa {
  inst_codigo: number;
  inst_descripcion: string;
  inst_pp: string | null;
  inst_p: string | null;
  inst_s: string | null;
  inst_t: string | null;
  inst_i: string | null;
}

export interface Empleado {
  empl_legajo: number;
  empl_nombre: string;
  empl_ape: string | null;
  empl_doc_ident: number | null;
  empl_ruc: string | null;
  empl_sexo: string | null;
  empl_est_civil: string | null;
  empl_fec_nac: string | null;
  empl_nacionalidad: string | null;
  empl_situacion: string | null;
  empl_cargo: number | null;
  car_desc?: string;
  empl_categ: number | null;
  pcat_desc?: string;
  empl_area: number | null;
  area_desc?: string;
  empl_seccion: number | null;
  secc_desc?: string;
  empl_turno: number | null;
  tur_desc?: string;
  empl_fec_ingreso: string | null;
  empl_fec_salida: string | null;
  empl_motivo_salida: string | null;
  empl_salario_base: number | null;
  empl_nro_seg_social: string | null;
  empl_dir: string | null;
  empl_tel: string | null;
  empl_tel_celular: string | null;
  empl_mail_particular: string | null;
  empl_mail_laboral: string | null;
  empl_observa: string | null;
}
