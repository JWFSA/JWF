'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCargos, getCategorias, getAreas, getSecciones, getTurnos } from '@/services/per';
import type { Empleado } from '@/types/per';

interface Props {
  initial?: Partial<Empleado>;
  onSave: (data: Partial<Empleado>) => Promise<void>;
  isPending: boolean;
  error?: string;
}

const normDate = (v: string | null | undefined) => v ? v.toString().substring(0, 10) : '';

const empty: Partial<Empleado> = {
  empl_nombre: '', empl_ape: '', empl_doc_ident: null, empl_ruc: '',
  empl_sexo: '', empl_est_civil: '', empl_fec_nac: null, empl_nacionalidad: '',
  empl_situacion: 'A', empl_cargo: null, empl_categ: null,
  empl_area: null, empl_seccion: null, empl_turno: null,
  empl_fec_ingreso: null, empl_fec_salida: null, empl_motivo_salida: '',
  empl_salario_base: null, empl_nro_seg_social: '',
  empl_dir: '', empl_tel: '', empl_tel_celular: '',
  empl_mail_particular: '', empl_mail_laboral: '', empl_observa: '',
};

const SEXOS    = [{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Femenino' }];
const CIVILES  = [{ v: 'S', l: 'Soltero/a' }, { v: 'C', l: 'Casado/a' }, { v: 'D', l: 'Divorciado/a' }, { v: 'V', l: 'Viudo/a' }, { v: 'U', l: 'Unión libre' }];
const SITUACIONES = [{ v: 'A', l: 'Activo' }, { v: 'I', l: 'Inactivo' }];

export default function EmpleadoForm({ initial, onSave, isPending, error }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Empleado>>({
    ...empty,
    ...initial,
    empl_fec_nac:      normDate(initial?.empl_fec_nac),
    empl_fec_ingreso:  normDate(initial?.empl_fec_ingreso),
    empl_fec_salida:   normDate(initial?.empl_fec_salida),
  });

  const set = (k: keyof Empleado, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const { data: cargosData }    = useQuery({ queryKey: ['cargos', { all: true }],    queryFn: () => getCargos({ all: true }) });
  const { data: categsData }    = useQuery({ queryKey: ['categorias-per', { all: true }], queryFn: () => getCategorias({ all: true }) });
  const { data: areasData }     = useQuery({ queryKey: ['areas', { all: true }],     queryFn: () => getAreas({ all: true }) });
  const { data: seccsData }     = useQuery({ queryKey: ['secciones', { all: true }], queryFn: () => getSecciones({ all: true }) });
  const { data: turnosData }    = useQuery({ queryKey: ['turnos', { all: true }],    queryFn: () => getTurnos({ all: true }) });

  const cargos   = cargosData?.data  ?? [];
  const categs   = categsData?.data  ?? [];
  const areas    = areasData?.data   ?? [];
  const secciones = seccsData?.data  ?? [];
  const turnos   = turnosData?.data  ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  const field = (label: string, key: keyof Empleado, opts?: { type?: string; required?: boolean; placeholder?: string; span?: boolean }) => (
    <div className={opts?.span ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={opts?.type ?? 'text'}
        value={(form[key] as string) ?? ''}
        onChange={(e) => set(key, e.target.value || (opts?.type === 'number' ? null : ''))}
        placeholder={opts?.placeholder}
        required={opts?.required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );

  const selectField = (label: string, key: keyof Empleado, options: { v: string; l: string }[], opts?: { required?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={(form[key] as string) ?? ''}
        onChange={(e) => set(key, e.target.value || null)}
        required={opts?.required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">— Seleccione —</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Datos personales */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Datos personales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {field('Nombre', 'empl_nombre', { required: true, placeholder: 'Nombre(s)' })}
          {field('Apellido', 'empl_ape', { placeholder: 'Apellido(s)' })}
          {field('Cédula de identidad', 'empl_doc_ident', { type: 'number', placeholder: '1234567' })}
          {field('RUC', 'empl_ruc', { placeholder: '1234567-8' })}
          {field('Fecha de nacimiento', 'empl_fec_nac', { type: 'date' })}
          {field('Nacionalidad', 'empl_nacionalidad', { placeholder: 'Paraguayo/a' })}
          {selectField('Sexo', 'empl_sexo', SEXOS)}
          {selectField('Estado civil', 'empl_est_civil', CIVILES)}
          {field('Nro. seguro social (IPS)', 'empl_nro_seg_social', { placeholder: 'Nro. IPS' })}
        </div>
      </div>

      {/* Datos laborales */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Datos laborales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {selectField('Situación', 'empl_situacion', SITUACIONES, { required: true })}
          {field('Fecha de ingreso', 'empl_fec_ingreso', { type: 'date' })}
          {field('Fecha de salida', 'empl_fec_salida', { type: 'date' })}
          {field('Motivo de salida', 'empl_motivo_salida', { placeholder: 'Ej: Renuncia' })}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <select value={form.empl_cargo ?? ''} onChange={(e) => set('empl_cargo', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Seleccione —</option>
              {cargos.map((c) => <option key={c.car_codigo} value={c.car_codigo}>{c.car_desc}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select value={form.empl_categ ?? ''} onChange={(e) => set('empl_categ', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Seleccione —</option>
              {categs.map((c) => <option key={c.pcat_codigo} value={c.pcat_codigo}>{c.pcat_desc}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
            <select value={form.empl_area ?? ''} onChange={(e) => set('empl_area', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Seleccione —</option>
              {areas.map((a) => <option key={a.per_area_cod} value={a.per_area_cod}>{a.per_area_desc}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sección</label>
            <select value={form.empl_seccion ?? ''} onChange={(e) => set('empl_seccion', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Seleccione —</option>
              {secciones.map((s) => <option key={s.per_secc_cod} value={s.per_secc_cod}>{s.per_secc_desc}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
            <select value={form.empl_turno ?? ''} onChange={(e) => set('empl_turno', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Seleccione —</option>
              {turnos.map((t) => <option key={t.tur_codigo} value={t.tur_codigo}>{t.tur_desc}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salario base</label>
            <input type="number" min="0" step="1"
              value={form.empl_salario_base ?? ''}
              onChange={(e) => set('empl_salario_base', e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {field('Dirección', 'empl_dir', { placeholder: 'Calle y número', span: true })}
          {field('Teléfono', 'empl_tel', { placeholder: '021-000000' })}
          {field('Celular', 'empl_tel_celular', { placeholder: '0981-000000' })}
          {field('Email personal', 'empl_mail_particular', { type: 'email', placeholder: 'correo@email.com' })}
          {field('Email laboral', 'empl_mail_laboral', { type: 'email', placeholder: 'correo@empresa.com' })}
        </div>
      </div>

      {/* Observaciones */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Observaciones</h2>
        <textarea
          value={form.empl_observa ?? ''}
          onChange={(e) => set('empl_observa', e.target.value)}
          rows={3}
          placeholder="Notas adicionales sobre el empleado..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

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
