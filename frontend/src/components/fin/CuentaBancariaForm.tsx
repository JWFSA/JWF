'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CuentaBancaria } from '@/types/fin';
import type { Banco } from '@/types/fin';
import type { Moneda } from '@/types/gen';
import { toInputDate } from '@/lib/utils';

interface Props {
  initialData?: CuentaBancaria;
  bancos: Banco[];
  monedas: Moneda[];
  isPending: boolean;
  error: string;
  onSubmit: (data: Partial<CuentaBancaria>) => void;
  onCancel: () => void;
}

const emptyForm = {
  cta_desc: '',
  cta_bco: '',
  cta_tipo_cta: '',
  cta_mon: '',
  cta_fec_habilit: '',
};

export default function CuentaBancariaForm({ initialData, bancos, monedas, isPending, error, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    cta_desc:       initialData?.cta_desc ?? '',
    cta_bco:        initialData?.cta_bco?.toString() ?? '',
    cta_tipo_cta:   initialData?.cta_tipo_cta ?? '',
    cta_mon:        initialData?.cta_mon?.toString() ?? '',
    cta_fec_habilit: initialData?.cta_fec_habilit
      ? toInputDate(initialData.cta_fec_habilit)
      : '',
  });
  const [localError, setLocalError] = useState('');

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cta_desc.trim()) { setLocalError('La descripción es requerida'); return; }
    setLocalError('');
    onSubmit({
      cta_desc:       form.cta_desc,
      cta_bco:        form.cta_bco ? Number(form.cta_bco) : null,
      cta_tipo_cta:   form.cta_tipo_cta || null,
      cta_mon:        form.cta_mon ? Number(form.cta_mon) : null,
      cta_fec_habilit: form.cta_fec_habilit || null,
    });
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
          <input
            value={form.cta_desc}
            onChange={(e) => set('cta_desc', e.target.value)}
            placeholder="Ej: Banco Itaú Guaraníes"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
          <select value={form.cta_bco} onChange={(e) => set('cta_bco', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Sin banco —</option>
            {bancos.map((b) => <option key={b.bco_codigo} value={b.bco_codigo}>{b.bco_desc}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta</label>
          <select value={form.cta_tipo_cta} onChange={(e) => set('cta_tipo_cta', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Sin tipo —</option>
            <option value="C">Corriente</option>
            <option value="A">Ahorro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
          <select value={form.cta_mon} onChange={(e) => set('cta_mon', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Sin moneda —</option>
            {monedas.map((m) => <option key={m.mon_codigo} value={m.mon_codigo}>{m.mon_desc}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de habilitación</label>
          <input
            type="date"
            value={form.cta_fec_habilit}
            onChange={(e) => set('cta_fec_habilit', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {displayError && <p className="mt-4 text-sm text-red-600">{displayError}</p>}

      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={isPending} className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
