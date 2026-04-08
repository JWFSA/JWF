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

export interface ClasificacionConcepto {
  clco_codigo: number;
  clco_desc: string;
  clco_tipo: string;
  clco_orden: number;
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

export interface Concepto {
  pcon_clave: number;
  pcon_clave_concepto: number | null;
  pcon_desc: string;
  pcon_ind_fijo: string | null;
  pcon_clave_ctaco: number | null;
  pcon_ind_aguinaldo: string | null;
  pcon_clas_concepto: number | null;
  clco_desc?: string;
  clco_tipo?: string;
  pcon_clas_conc_descuento: number | null;
  clde_desc?: string;
  pcon_conc_aguinaldo: string | null;
  pcon_conc_horas_extras: string | null;
  pcon_conc_bonif_familiar: string | null;
  pcon_ind_sum_ips: string | null;
  pcon_recibo_salario: string | null;
  pcon_ind_otros_beneficios: string | null;
  pcon_anticipo: string | null;
  pcon_ind_mjt: string | null;
  pcon_conc_comision: string | null;
  pcon_empresa: string | null;
  pcon_suma_bf: string | null;
  pcon_orden: number | null;
}

export interface Contrato {
  con_codigo: string;
  con_empleado: number;
  empl_nombre?: string;
  empl_ape?: string;
  con_tipo_contrato: number | null;
  tipcon_descripcion?: string;
  con_fecha_ini: string;
  con_fecha_fin: string | null;
  con_observacion: string | null;
  con_dias_preaviso: number | null;
  con_mov_propia: string | null;
}

export interface Familiar {
  fam_codigo: number;
  fam_empl_codigo: number;
  empl_nombre?: string;
  empl_ape?: string;
  fam_nombre: string;
  fam_fec_nac: string | null;
  fam_tipo: number | null;
  tipo_desc?: string;
  fam_sexo: string | null;
  fam_ind_cobra: string | null;
  fam_imp_bonif: number | null;
  fam_ind_disc: string | null;
}

export interface Empleado {
  empl_legajo: number;
  // Personal
  empl_nombre: string;
  empl_ape: string | null;
  empl_doc_ident: number | null;
  empl_ruc: string | null;
  empl_sexo: string | null;
  empl_est_civil: string | null;
  empl_fec_nac: string | null;
  empl_nacionalidad: number | null;
  pais_nacionalidad?: string;
  empl_nro_seg_social: string | null;
  empl_foto: string | null;
  // Laboral
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
  empl_sucursal: number | null;
  suc_desc?: string;
  empl_ccosto: number | null;
  cco_desc?: string;
  empl_cod_jefe: number | null;
  jefe_nombre?: string;
  jefe_ape?: string;
  empl_departamento: number | null;
  empl_fec_ingreso: string | null;
  empl_fec_salida: string | null;
  empl_motivo_salida: string | null;
  // Salario y compensación
  empl_salario_base: number | null;
  empl_tipo_salario: number | null;
  tipo_sal_desc?: string;
  empl_diurno: number | null;
  empl_nocturno: number | null;
  empl_mixto1: number | null;
  empl_mixto2: number | null;
  empl_plus_objetivo: number | null;
  empl_obj_hmes: number | null;
  empl_cobra_comision: string | null;
  empl_bonif_fliar: string | null;
  empl_ind_anticipos: string | null;
  // Tarifas hora
  empl_imp_hora_n_d: number | null;
  empl_imp_hora_n_n: number | null;
  empl_imp_hora_e_d: number | null;
  empl_imp_hora_e_n: number | null;
  empl_imp_hora_df_d: number | null;
  empl_imp_lleg_hora: number | null;
  // Horario
  empl_tipo_horar: string | null;
  empl_tiempo_alm: number | null;
  empl_desc_tiemp_alm: string | null;
  empl_calc_hr_ext: string | null;
  empl_lim_lleg_temp: number | null;
  empl_ind_trab_sab: string | null;
  // Banco
  empl_cta_bco: number | null;
  cta_desc?: string;
  empl_cta_cte: string | null;
  // Contacto
  empl_dir: string | null;
  empl_dir2: string | null;
  empl_dir3: string | null;
  empl_pais_dir: number | null;
  pais_dir_desc?: string;
  empl_distrito: number | null;
  distrito_desc?: string;
  empl_localidad: number | null;
  loc_desc?: string;
  empl_barrio: number | null;
  barr_desc?: string;
  empl_nro_casa: number | null;
  empl_tel: string | null;
  empl_tel_celular: string | null;
  empl_tel_corporat: string | null;
  empl_mail_particular: string | null;
  empl_mail_laboral: string | null;
  empl_nombre_emergencia: string | null;
  // IPS
  empl_fec_ingreso_ips: string | null;
  empl_situacion_ips: string | null;
  // Observaciones
  empl_observa: string | null;
}

export interface Liquidacion {
  pdoc_clave: number;
  pdoc_empleado: number;
  empl_nombre?: string;
  empl_ape?: string;
  pdoc_fec: string;
  pdoc_periodo: number | null;
  pdoc_quincena: number | null;
  pdoc_nro_doc: number | null;
  pdoc_fec_ini: string | null;
  pdoc_fec_fin: string | null;
  pdoc_procesado: string | null;
  pdoc_obs: string | null;
  pdoc_login?: string | null;
  pdoc_fec_grab?: string | null;
  detalle?: LiquidacionDet[];
}

export interface LiquidacionDet {
  pddet_clave_doc: number;
  pddet_item: number;
  pddet_clave_concepto: number | null;
  concepto_desc?: string;
  pddet_imp: number | null;
  pddet_cantidad: number | null;
  pddet_porcentaje: number | null;
  pddet_salario_base: number | null;
  pddet_cant_hs_extras: number | null;
  pddet_porc_hs_extras: number | null;
}

export interface EmplHorario {
  emplh_legajo: number;
  empl_nombre?: string;
  empl_ape?: string;
  emplh_item: number;
  emplh_dia: string | null;
  emplh_hora_ini: string | null;
  emplh_hora_fin: string | null;
}

export interface EmplConcepto {
  percon_empleado: number;
  empl_nombre?: string;
  empl_ape?: string;
  percon_concepto: number;
  concepto_desc?: string;
  percon_imp: number | null;
  percon_fec_pago: string | null;
  percon_fec_vto: string | null;
  percon_genera: string | null;
  percon_cuota: number | null;
}

export interface Ausencia {
  aus_legajo: number;
  empl_nombre?: string;
  empl_ape?: string;
  aus_fecha: string;
  aus_evento: string | null;
  aus_motivo: number | null;
  motivo_desc?: string;
  aus_justificada: string | null;
  aus_obs: string | null;
  aus_ind_descuento: string | null;
  aus_importe_ausencia: number | null;
}
