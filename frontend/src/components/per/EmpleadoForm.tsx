'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCargos, getCategorias, getAreas, getSecciones, getTurnos, getTiposSalario, getEmpleados } from '@/services/per';
import { getEmpresas, getSucursales, getPaises, getLocalidades, getBarrios, getDepartamentos } from '@/services/gen';
import { getCentrosCosto } from '@/services/cnt';
import { getCuentasBancarias } from '@/services/fin';
import type { Empleado } from '@/types/per';
import { toInputDate } from '@/lib/utils';

const coerceNum = z.coerce.number().nullable().optional();
const optStr = z.string().nullable().optional();
const snFlag = z.enum(['S', 'N']).nullable().optional();

const schema = z.object({
  // Personal
  empl_nombre: z.string().min(1, 'El nombre es requerido').max(100),
  empl_ape: z.string().min(1, 'El apellido es requerido').max(100),
  empl_doc_ident: coerceNum,
  empl_ruc: z.string().max(15).nullable().optional(),
  empl_sexo: z.enum(['M', 'F', '']).nullable().optional(),
  empl_est_civil: z.enum(['S', 'C', 'D', 'V', 'U', '']).nullable().optional(),
  empl_fec_nac: optStr,
  empl_nacionalidad: coerceNum,
  empl_nro_seg_social: optStr,
  empl_foto: optStr,
  // Laboral
  empl_situacion: z.enum(['A', 'I']),
  empl_cargo: coerceNum,
  empl_categ: coerceNum,
  empl_area: coerceNum,
  empl_seccion: coerceNum,
  empl_turno: coerceNum,
  empl_sucursal: coerceNum,
  empl_ccosto: coerceNum,
  empl_cod_jefe: coerceNum,
  empl_departamento: coerceNum,
  empl_fec_ingreso: optStr,
  empl_fec_salida: optStr,
  empl_motivo_salida: optStr,
  // Salario
  empl_salario_base: coerceNum,
  empl_tipo_salario: coerceNum,
  empl_diurno: coerceNum,
  empl_nocturno: coerceNum,
  empl_mixto1: coerceNum,
  empl_mixto2: coerceNum,
  empl_plus_objetivo: coerceNum,
  empl_obj_hmes: coerceNum,
  empl_cobra_comision: snFlag,
  empl_bonif_fliar: snFlag,
  empl_ind_anticipos: snFlag,
  // Tarifas hora
  empl_imp_hora_n_d: coerceNum,
  empl_imp_hora_n_n: coerceNum,
  empl_imp_hora_e_d: coerceNum,
  empl_imp_hora_e_n: coerceNum,
  empl_imp_hora_df_d: coerceNum,
  empl_imp_lleg_hora: coerceNum,
  // Horario
  empl_tipo_horar: z.enum(['A', 'F', '']).nullable().optional(),
  empl_tiempo_alm: coerceNum,
  empl_desc_tiemp_alm: snFlag,
  empl_calc_hr_ext: snFlag,
  empl_lim_lleg_temp: coerceNum,
  empl_ind_trab_sab: snFlag,
  // Banco
  empl_cta_bco: coerceNum,
  empl_cta_cte: optStr,
  // Contacto
  empl_dir: optStr,
  empl_dir2: optStr,
  empl_dir3: optStr,
  empl_localidad: coerceNum,
  empl_barrio: coerceNum,
  empl_nro_casa: coerceNum,
  empl_tel: optStr,
  empl_tel_celular: optStr,
  empl_tel_corporat: optStr,
  empl_mail_particular: z.string().email('Email inválido').or(z.literal('')).nullable().optional(),
  empl_mail_laboral: z.string().email('Email inválido').or(z.literal('')).nullable().optional(),
  empl_nombre_emergencia: optStr,
  // IPS
  empl_fec_ingreso_ips: optStr,
  empl_situacion_ips: snFlag,
  // Observaciones
  empl_observa: optStr,
});

type FormData = z.infer<typeof schema>;

interface Props {
  initial?: Partial<Empleado>;
  onSave: (data: Partial<Empleado>) => Promise<void>;
  isPending: boolean;
  error?: string;
}

const SEXOS     = [{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Femenino' }];
const CIVILES   = [{ v: 'S', l: 'Soltero/a' }, { v: 'C', l: 'Casado/a' }, { v: 'D', l: 'Divorciado/a' }, { v: 'V', l: 'Viudo/a' }, { v: 'U', l: 'Unión libre' }];
const SITUACIONES = [{ v: 'A', l: 'Activo' }, { v: 'I', l: 'Inactivo' }];
const TIPO_HORAR = [{ v: 'A', l: 'Asignado' }, { v: 'F', l: 'Fijo' }];
const SN_OPTS    = [{ v: 'S', l: 'Sí' }, { v: 'N', l: 'No' }];

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
const errCls = 'text-xs text-red-500 mt-1';

export default function EmpleadoForm({ initial, onSave, isPending, error }: Props) {
  const router = useRouter();

  const defaults: FormData = {
    empl_nombre: initial?.empl_nombre ?? '',
    empl_ape: initial?.empl_ape ?? '',
    empl_doc_ident: initial?.empl_doc_ident ?? null,
    empl_ruc: initial?.empl_ruc ?? '',
    empl_sexo: (initial?.empl_sexo ?? '') as 'M' | 'F' | '',
    empl_est_civil: (initial?.empl_est_civil ?? '') as 'S' | 'C' | 'D' | 'V' | 'U' | '',
    empl_fec_nac: toInputDate(initial?.empl_fec_nac) ?? '',
    empl_nacionalidad: initial?.empl_nacionalidad ?? null,
    empl_nro_seg_social: initial?.empl_nro_seg_social ?? '',
    empl_foto: initial?.empl_foto ?? '',
    empl_situacion: (initial?.empl_situacion as 'A' | 'I') ?? 'A',
    empl_cargo: initial?.empl_cargo ?? null,
    empl_categ: initial?.empl_categ ?? null,
    empl_area: initial?.empl_area ?? null,
    empl_seccion: initial?.empl_seccion ?? null,
    empl_turno: initial?.empl_turno ?? null,
    empl_sucursal: initial?.empl_sucursal ?? null,
    empl_ccosto: initial?.empl_ccosto ?? null,
    empl_cod_jefe: initial?.empl_cod_jefe ?? null,
    empl_departamento: initial?.empl_departamento ?? null,
    empl_fec_ingreso: toInputDate(initial?.empl_fec_ingreso) ?? '',
    empl_fec_salida: toInputDate(initial?.empl_fec_salida) ?? '',
    empl_motivo_salida: initial?.empl_motivo_salida ?? '',
    empl_salario_base: initial?.empl_salario_base ?? null,
    empl_tipo_salario: initial?.empl_tipo_salario ?? null,
    empl_diurno: initial?.empl_diurno ?? null,
    empl_nocturno: initial?.empl_nocturno ?? null,
    empl_mixto1: initial?.empl_mixto1 ?? null,
    empl_mixto2: initial?.empl_mixto2 ?? null,
    empl_plus_objetivo: initial?.empl_plus_objetivo ?? null,
    empl_obj_hmes: initial?.empl_obj_hmes ?? null,
    empl_cobra_comision: (initial?.empl_cobra_comision ?? 'N') as 'S' | 'N',
    empl_bonif_fliar: (initial?.empl_bonif_fliar ?? 'N') as 'S' | 'N',
    empl_ind_anticipos: (initial?.empl_ind_anticipos ?? 'N') as 'S' | 'N',
    empl_imp_hora_n_d: initial?.empl_imp_hora_n_d ?? null,
    empl_imp_hora_n_n: initial?.empl_imp_hora_n_n ?? null,
    empl_imp_hora_e_d: initial?.empl_imp_hora_e_d ?? null,
    empl_imp_hora_e_n: initial?.empl_imp_hora_e_n ?? null,
    empl_imp_hora_df_d: initial?.empl_imp_hora_df_d ?? null,
    empl_imp_lleg_hora: initial?.empl_imp_lleg_hora ?? null,
    empl_tipo_horar: (initial?.empl_tipo_horar ?? '') as 'A' | 'F' | '',
    empl_tiempo_alm: initial?.empl_tiempo_alm ?? null,
    empl_desc_tiemp_alm: (initial?.empl_desc_tiemp_alm ?? 'N') as 'S' | 'N',
    empl_calc_hr_ext: (initial?.empl_calc_hr_ext ?? 'N') as 'S' | 'N',
    empl_lim_lleg_temp: initial?.empl_lim_lleg_temp ?? null,
    empl_ind_trab_sab: (initial?.empl_ind_trab_sab ?? 'N') as 'S' | 'N',
    empl_cta_bco: initial?.empl_cta_bco ?? null,
    empl_cta_cte: initial?.empl_cta_cte ?? '',
    empl_dir: initial?.empl_dir ?? '',
    empl_dir2: initial?.empl_dir2 ?? '',
    empl_dir3: initial?.empl_dir3 ?? '',
    empl_localidad: initial?.empl_localidad ?? null,
    empl_barrio: initial?.empl_barrio ?? null,
    empl_nro_casa: initial?.empl_nro_casa ?? null,
    empl_tel: initial?.empl_tel ?? '',
    empl_tel_celular: initial?.empl_tel_celular ?? '',
    empl_tel_corporat: initial?.empl_tel_corporat ?? '',
    empl_mail_particular: initial?.empl_mail_particular ?? '',
    empl_mail_laboral: initial?.empl_mail_laboral ?? '',
    empl_nombre_emergencia: initial?.empl_nombre_emergencia ?? '',
    empl_fec_ingreso_ips: toInputDate(initial?.empl_fec_ingreso_ips) ?? '',
    empl_situacion_ips: (initial?.empl_situacion_ips ?? '') as 'S' | 'N' | '',
    empl_observa: initial?.empl_observa ?? '',
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const empresaId = 1; // hardcoded por ahora, como en el legacy
  const watchedSucursal = watch('empl_sucursal');

  // Queries para dropdowns
  const { data: cargosData }    = useQuery({ queryKey: ['cargos', { all: true }],       queryFn: () => getCargos({ all: true }) });
  const { data: categsData }    = useQuery({ queryKey: ['categorias-per', { all: true }], queryFn: () => getCategorias({ all: true }) });
  const { data: areasData }     = useQuery({ queryKey: ['areas', { all: true }],         queryFn: () => getAreas({ all: true }) });
  const { data: seccsData }     = useQuery({ queryKey: ['secciones', { all: true }],     queryFn: () => getSecciones({ all: true }) });
  const { data: turnosData }    = useQuery({ queryKey: ['turnos', { all: true }],        queryFn: () => getTurnos({ all: true }) });
  const { data: tiposSalData }  = useQuery({ queryKey: ['tipos-salario', { all: true }], queryFn: () => getTiposSalario({ all: true }) });
  const { data: sucursalesData } = useQuery({ queryKey: ['sucursales', empresaId],       queryFn: () => getSucursales(empresaId), enabled: !!empresaId });
  const { data: ccostoData }    = useQuery({ queryKey: ['centros-costo', { all: true }], queryFn: () => getCentrosCosto({ all: true }) });
  const { data: ctasBcoData }   = useQuery({ queryKey: ['cuentas-bancarias', { all: true }], queryFn: () => getCuentasBancarias({ all: true }) });
  const { data: empleadosData } = useQuery({ queryKey: ['empleados', { all: true }],     queryFn: () => getEmpleados({ all: true }) });
  const { data: paisesData }    = useQuery({ queryKey: ['paises'],                       queryFn: () => getPaises() });
  const { data: localidadesData } = useQuery({ queryKey: ['localidades', { all: true }], queryFn: () => getLocalidades({ all: true }) });
  const { data: barriosData }   = useQuery({ queryKey: ['barrios', { all: true }],       queryFn: () => getBarrios({ all: true }) });
  const { data: deptosData }   = useQuery({ queryKey: ['departamentos'],                  queryFn: () => getDepartamentos() });

  const cargos     = cargosData?.data  ?? [];
  const categs     = categsData?.data  ?? [];
  const areas      = areasData?.data   ?? [];
  const secciones  = seccsData?.data   ?? [];
  const turnos     = turnosData?.data  ?? [];
  const tiposSal   = tiposSalData?.data ?? [];
  const sucursales = sucursalesData     ?? [];
  const ccosList   = ccostoData?.data   ?? [];
  const ctasBco    = ctasBcoData?.data  ?? [];
  const empleados  = empleadosData?.data ?? [];
  const paises       = paisesData ?? [];
  const localidades  = localidadesData?.data ?? [];
  const barrios      = barriosData?.data ?? [];
  const deptos       = deptosData ?? [];

  const onSubmit = async (data: FormData) => {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      clean[k] = v === '' ? null : v;
    }
    await onSave(clean as Partial<Empleado>);
  };

  // Helpers de renderizado
  const field = (label: string, name: keyof FormData, opts?: { type?: string; required?: boolean; placeholder?: string; span?: boolean; step?: string }) => (
    <div className={opts?.span ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={opts?.type ?? 'text'}
        {...register(name, { setValueAs: opts?.type === 'number' ? (v: string) => (v === '' ? null : Number(v)) : undefined })}
        placeholder={opts?.placeholder}
        step={opts?.step}
        className={input}
      />
      {errors[name] && <p className={errCls}>{errors[name]?.message as string}</p>}
    </div>
  );

  const selectField = (label: string, name: keyof FormData, options: { v: string; l: string }[], opts?: { required?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      <select {...register(name)} className={input}>
        <option value="">— Seleccione —</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      {errors[name] && <p className={errCls}>{errors[name]?.message as string}</p>}
    </div>
  );

  const fkSelect = (label: string, name: keyof FormData, items: { code: number; desc: string }[], opts?: { required?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...register(name, { setValueAs: (v: string) => (v === '' ? null : Number(v)) })}
        className={input}
      >
        <option value="">— Seleccione —</option>
        {items.map((i) => <option key={i.code} value={i.code}>{i.desc}</option>)}
      </select>
      {errors[name] && <p className={errCls}>{errors[name]?.message as string}</p>}
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* 1. Datos personales */}
      <Section title="Datos personales">
        {field('Nombre', 'empl_nombre', { required: true, placeholder: 'Nombre(s)' })}
        {field('Apellido', 'empl_ape', { required: true, placeholder: 'Apellido(s)' })}
        {field('Cédula de identidad', 'empl_doc_ident', { type: 'number', placeholder: '1234567' })}
        {field('RUC', 'empl_ruc', { placeholder: '1234567-8' })}
        {field('Fecha de nacimiento', 'empl_fec_nac', { type: 'date' })}
        {fkSelect('Nacionalidad', 'empl_nacionalidad', paises.filter((p) => p.pais_nacionalidad).map((p) => ({ code: p.pais_codigo, desc: p.pais_nacionalidad! })))}
        {selectField('Sexo', 'empl_sexo', SEXOS)}
        {selectField('Estado civil', 'empl_est_civil', CIVILES)}
        {field('Nro. seguro social (IPS)', 'empl_nro_seg_social', { placeholder: 'Nro. IPS' })}
      </Section>

      {/* 2. Datos laborales */}
      <Section title="Datos laborales">
        {selectField('Situación', 'empl_situacion', SITUACIONES, { required: true })}
        {fkSelect('Sucursal', 'empl_sucursal', sucursales.map((s) => ({ code: s.suc_codigo, desc: s.suc_desc })))}
        {fkSelect('Cargo', 'empl_cargo', cargos.map((c) => ({ code: c.car_codigo, desc: c.car_desc })))}
        {fkSelect('Categoría', 'empl_categ', categs.map((c) => ({ code: c.pcat_codigo, desc: c.pcat_desc })))}
        {fkSelect('Área', 'empl_area', areas.map((a) => ({ code: a.per_area_cod, desc: a.per_area_desc })))}
        {fkSelect('Sección', 'empl_seccion', secciones.map((s) => ({ code: s.per_secc_cod, desc: s.per_secc_desc })))}
        {fkSelect('Turno', 'empl_turno', turnos.map((t) => ({ code: t.tur_codigo, desc: t.tur_desc })))}
        {fkSelect('Centro de costo', 'empl_ccosto', ccosList.map((c) => ({ code: c.CCO_CODIGO, desc: c.CCO_DESC })))}
        {fkSelect('Jefe / Supervisor', 'empl_cod_jefe', empleados.map((e) => ({ code: e.empl_legajo, desc: `${e.empl_nombre} ${e.empl_ape ?? ''}`.trim() })))}
        {fkSelect('Departamento', 'empl_departamento', deptos.map((d) => ({ code: d.dpto_codigo, desc: d.dpto_desc })))}
        {field('Fecha de ingreso', 'empl_fec_ingreso', { type: 'date' })}
        {field('Fecha de salida', 'empl_fec_salida', { type: 'date' })}
        {field('Motivo de salida', 'empl_motivo_salida', { placeholder: 'Ej: Renuncia' })}
      </Section>

      {/* 3. Salario y compensación */}
      <Section title="Salario y compensación">
        {field('Salario base', 'empl_salario_base', { type: 'number', placeholder: '0', step: '0.01' })}
        {fkSelect('Tipo de salario', 'empl_tipo_salario', tiposSal.map((t) => ({ code: t.ptipo_sal_codigo, desc: t.ptipo_sal_desc })))}
        {field('Salario diurno', 'empl_diurno', { type: 'number', step: '0.01' })}
        {field('Salario nocturno', 'empl_nocturno', { type: 'number', step: '0.01' })}
        {field('Salario mixto 1', 'empl_mixto1', { type: 'number', step: '0.01' })}
        {field('Salario mixto 2', 'empl_mixto2', { type: 'number', step: '0.01' })}
        {field('Plus por objetivo', 'empl_plus_objetivo', { type: 'number', step: '0.01' })}
        {field('Hs. mensuales objetivo', 'empl_obj_hmes', { type: 'number', step: '0.01' })}
        {selectField('Cobra comisión', 'empl_cobra_comision', SN_OPTS)}
        {selectField('Bonificación familiar', 'empl_bonif_fliar', SN_OPTS)}
        {selectField('Recibe anticipos', 'empl_ind_anticipos', SN_OPTS)}
      </Section>

      {/* 4. Tarifas por hora */}
      <Section title="Tarifas por hora">
        {field('Hora normal diurna', 'empl_imp_hora_n_d', { type: 'number', step: '0.01' })}
        {field('Hora normal nocturna', 'empl_imp_hora_n_n', { type: 'number', step: '0.01' })}
        {field('Hora extra diurna', 'empl_imp_hora_e_d', { type: 'number', step: '0.01' })}
        {field('Hora extra nocturna', 'empl_imp_hora_e_n', { type: 'number', step: '0.01' })}
        {field('Hora dom/feriado diurna', 'empl_imp_hora_df_d', { type: 'number', step: '0.01' })}
        {field('Bono puntualidad', 'empl_imp_lleg_hora', { type: 'number', step: '0.01' })}
      </Section>

      {/* 5. Horario */}
      <Section title="Horario">
        {selectField('Tipo de horario', 'empl_tipo_horar', TIPO_HORAR)}
        {field('Tiempo almuerzo (min)', 'empl_tiempo_alm', { type: 'number', step: '0.01' })}
        {selectField('Descuenta almuerzo', 'empl_desc_tiemp_alm', SN_OPTS)}
        {selectField('Calcula hs. extra', 'empl_calc_hr_ext', SN_OPTS)}
        {field('Lím. llegada temprana', 'empl_lim_lleg_temp', { type: 'number' })}
        {selectField('Trabaja sábados', 'empl_ind_trab_sab', SN_OPTS)}
      </Section>

      {/* 6. Datos bancarios */}
      <Section title="Datos bancarios">
        {fkSelect('Cuenta bancaria', 'empl_cta_bco', ctasBco.map((c) => ({ code: c.cta_codigo, desc: c.cta_desc })))}
        {field('Nro. cuenta corriente', 'empl_cta_cte', { placeholder: 'Nro. de cuenta' })}
      </Section>

      {/* 7. Contacto */}
      <Section title="Contacto">
        {field('Dirección principal', 'empl_dir', { placeholder: 'Calle y número', span: true })}
        {field('Dirección 2', 'empl_dir2', { placeholder: 'Dirección adicional' })}
        {field('Dirección 3', 'empl_dir3', { placeholder: 'Dirección adicional' })}
        {fkSelect('Localidad', 'empl_localidad', localidades.map((l) => ({ code: l.loc_codigo, desc: l.loc_desc })))}
        {fkSelect('Barrio', 'empl_barrio', barrios.map((b) => ({ code: b.barr_codigo, desc: b.barr_desc })))}
        {field('Nro. casa', 'empl_nro_casa', { type: 'number' })}
        {field('Teléfono', 'empl_tel', { placeholder: '021-000000' })}
        {field('Celular', 'empl_tel_celular', { placeholder: '0981-000000' })}
        {field('Tel. corporativo', 'empl_tel_corporat', { placeholder: '021-000000' })}
        {field('Email personal', 'empl_mail_particular', { type: 'email', placeholder: 'correo@email.com' })}
        {field('Email laboral', 'empl_mail_laboral', { type: 'email', placeholder: 'correo@empresa.com' })}
        {field('Contacto de emergencia', 'empl_nombre_emergencia', { placeholder: 'Nombre y teléfono' })}
      </Section>

      {/* 8. IPS y Observaciones */}
      <Section title="IPS y observaciones">
        {field('Fecha ingreso IPS', 'empl_fec_ingreso_ips', { type: 'date' })}
        {selectField('Situación IPS', 'empl_situacion_ips', SN_OPTS)}
        <div className="sm:col-span-2 md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea
            {...register('empl_observa')}
            rows={3}
            placeholder="Notas adicionales sobre el empleado..."
            className={`${input} resize-none`}
          />
        </div>
      </Section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
          {isPending ? 'Guardando…' : 'Guardar empleado'}
        </button>
      </div>
    </form>
  );
}
