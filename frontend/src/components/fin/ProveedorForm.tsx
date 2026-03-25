'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getTiposProveedor } from '@/services/fin';
import type { Proveedor } from '@/types/fin';

interface Props {
  initial?: Partial<Proveedor>;
  onSave: (data: Partial<Proveedor>) => Promise<void>;
  isPending: boolean;
  error?: string;
}

const empty: Partial<Proveedor> = {
  prov_razon_social: '', prov_propietario: '', prov_ruc: '', prov_tel: '',
  prov_fax: '', prov_celular: '', prov_email: '', prov_dir2: '',
  prov_pais: null, prov_tipo: null, prov_est_prov: 'A',
  prov_plazo_pago: '', prov_pers_contacto: '', prov_pers_contacto2: '',
  prov_obs: '', prov_tributo_unico: 'N', prov_retencion: 'N',
};

export default function ProveedorForm({ initial, onSave, isPending, error }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Proveedor>>({ ...empty, ...initial });
  const set = (k: keyof Proveedor, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const { data: tiposData } = useQuery({
    queryKey: ['tipos-proveedor', { all: true }],
    queryFn: () => getTiposProveedor({ all: true }),
  });
  const tipos = tiposData?.data ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  const inp = (label: string, k: keyof Proveedor, required = false, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        value={(form[k] as string) ?? ''}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos principales */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Datos principales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            {inp('Razón social', 'prov_razon_social', true, 'Nombre o razón social')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.prov_est_prov ?? 'A'} onChange={(e) => set('prov_est_prov', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>
          {inp('RUC', 'prov_ruc', false, 'Ej: 80044141-9')}
          {inp('Propietario', 'prov_propietario')}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de proveedor</label>
            <select value={form.prov_tipo ?? ''} onChange={(e) => set('prov_tipo', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Sin tipo —</option>
              {tipos.map((t) => <option key={t.tipr_codigo} value={t.tipr_codigo}>{t.tipr_desc}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {inp('Teléfono', 'prov_tel', false, 'Ej: 021 555 000')}
          {inp('Celular', 'prov_celular', false, 'Ej: 0981 555 000')}
          {inp('Fax', 'prov_fax')}
          <div className="sm:col-span-2">
            {inp('Email', 'prov_email', false, 'proveedor@ejemplo.com')}
          </div>
          {inp('Plazo de pago', 'prov_plazo_pago', false, 'Ej: 30 días')}
          {inp('Persona de contacto', 'prov_pers_contacto')}
          {inp('Contacto 2', 'prov_pers_contacto2')}
        </div>
      </div>

      {/* Dirección y configuración */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Dirección y configuración</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            {inp('Dirección', 'prov_dir2')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tributo único</label>
            <select value={form.prov_tributo_unico ?? 'N'} onChange={(e) => set('prov_tributo_unico', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retención</label>
            <select value={form.prov_retencion ?? 'N'} onChange={(e) => set('prov_retencion', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea value={form.prov_obs ?? ''} onChange={(e) => set('prov_obs', e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
          {isPending ? 'Guardando…' : 'Guardar proveedor'}
        </button>
      </div>
    </form>
  );
}
