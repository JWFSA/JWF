'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGrupos, getRubros, getCentrosCosto } from '@/services/cnt';
import type { Cuenta } from '@/types/cnt';

interface Props {
  initialData?: Cuenta;
  isPending: boolean;
  error: string;
  onSubmit: (data: Partial<Cuenta>) => void;
  onCancel: () => void;
}

export default function CuentaForm({ initialData, isPending, error, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    ctac_nro:            initialData?.ctac_nro ?? '',
    ctac_desc:           initialData?.ctac_desc ?? '',
    ctac_nivel:          initialData?.ctac_nivel?.toString() ?? '',
    ctac_grupo:          initialData?.ctac_grupo?.toString() ?? '',
    ctac_rubro:          initialData?.ctac_rubro?.toString() ?? '',
    ctac_ccosto:         initialData?.ctac_ccosto?.toString() ?? '',
    ctac_ind_imputable:  initialData?.ctac_ind_imputable ?? 'N',
    ctac_clave_padre:    initialData?.ctac_clave_padre?.toString() ?? '',
  });
  const [localError, setLocalError] = useState('');

  const { data: gruposData } = useQuery({ queryKey: ['cnt-grupos', { all: true }], queryFn: () => getGrupos({ all: true }) });
  const { data: rubrosData } = useQuery({ queryKey: ['cnt-rubros', { all: true }], queryFn: () => getRubros({ all: true }) });
  const { data: ccostoData } = useQuery({ queryKey: ['cnt-centros-costo', { all: true }], queryFn: () => getCentrosCosto({ all: true }) });

  const grupos  = gruposData?.data ?? [];
  const rubros  = rubrosData?.data ?? [];
  const ccostos = ccostoData?.data ?? [];

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ctac_nro || !form.ctac_desc) { setLocalError('El número y descripción son requeridos'); return; }
    setLocalError('');
    onSubmit({
      ctac_nro:           form.ctac_nro,
      ctac_desc:          form.ctac_desc,
      ctac_nivel:         form.ctac_nivel         ? Number(form.ctac_nivel) : null,
      ctac_grupo:         form.ctac_grupo         ? Number(form.ctac_grupo) : null,
      ctac_rubro:         form.ctac_rubro         ? Number(form.ctac_rubro) : null,
      ctac_ccosto:        form.ctac_ccosto        ? Number(form.ctac_ccosto) : null,
      ctac_ind_imputable: form.ctac_ind_imputable || 'N',
      ctac_clave_padre:   form.ctac_clave_padre   ? Number(form.ctac_clave_padre) : null,
    });
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número cuenta <span className="text-red-500">*</span></label>
          <input value={form.ctac_nro} onChange={(e) => set('ctac_nro', e.target.value)}
            placeholder="Ej: 111010100"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
          <input type="number" min="1" max="9" value={form.ctac_nivel} onChange={(e) => set('ctac_nivel', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
          <input value={form.ctac_desc} onChange={(e) => set('ctac_desc', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
          <select value={form.ctac_grupo} onChange={(e) => set('ctac_grupo', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Sin grupo —</option>
            {grupos.map((g) => <option key={g.GRUP_CODIGO} value={g.GRUP_CODIGO}>{g.GRUP_DESC}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imputable</label>
          <select value={form.ctac_ind_imputable} onChange={(e) => set('ctac_ind_imputable', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="N">No</option>
            <option value="S">Sí</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rubro</label>
          <select value={form.ctac_rubro} onChange={(e) => set('ctac_rubro', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Sin rubro —</option>
            {rubros.map((r) => <option key={r.RUB_CODIGO} value={r.RUB_CODIGO}>{r.RUB_DESC}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Centro de costo</label>
          <select value={form.ctac_ccosto} onChange={(e) => set('ctac_ccosto', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Sin centro de costo —</option>
            {ccostos.map((c) => <option key={c.CCO_CODIGO} value={c.CCO_CODIGO}>{c.CCO_DESC}</option>)}
          </select>
        </div>
      </div>

      {displayError && <p className="mt-4 text-sm text-red-600">{displayError}</p>}

      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
