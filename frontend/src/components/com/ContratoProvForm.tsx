'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProveedores } from '@/services/fin';
import { getMonedas } from '@/services/gen';
import type { ContratoProv, ContratoProvDet } from '@/types/com';
import type { Proveedor } from '@/types/fin';
import { Search, Plus, Trash2 } from 'lucide-react';
import { toInputDate } from '@/lib/utils';

interface Props {
  initialData?: ContratoProv;
  isPending: boolean;
  error: string;
  onSubmit: (data: Partial<ContratoProv>) => void;
  onCancel: () => void;
}

const emptyLine = (): ContratoProvDet => ({
  cond_local: null,
  cond_fec_ini: null,
  cond_fec_fin: null,
  cond_un_med: 'MES',
  cond_cant: 0,
  cond_precio: 0,
  cond_imp_total: 0,
});

const fmt = (n: number | null | undefined) =>
  n == null ? '' : new Intl.NumberFormat('es-PY').format(Number(n));

export default function ContratoProvForm({ initialData, isPending, error, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    cont_prov:         initialData?.cont_prov?.toString() ?? '',
    cont_fecha:        initialData?.cont_fecha       ? toInputDate(initialData.cont_fecha) : new Date().toISOString().split('T')[0],
    cont_mon:          initialData?.cont_mon?.toString() ?? '',
    cont_ind_interno:  initialData?.cont_ind_interno  ?? 'N',
    cont_ind_anterior: initialData?.cont_ind_anterior ?? 'N',
    cont_ind_vigente:  initialData?.cont_ind_vigente  ?? 'S',
    cont_obs:          initialData?.cont_obs ?? '',
  });
  const [detalle, setDetalle] = useState<ContratoProvDet[]>(
    initialData?.detalle?.length ? initialData.detalle.map((d) => ({
      ...d,
      cond_fec_ini: d.cond_fec_ini ? toInputDate(d.cond_fec_ini) : null,
      cond_fec_fin: d.cond_fec_fin ? toInputDate(d.cond_fec_fin) : null,
    })) : [emptyLine()]
  );
  const [localError, setLocalError] = useState('');

  // Proveedor search
  const [provSearch, setProvSearch] = useState(initialData?.prov_nom ?? '');
  const [debouncedProvSearch, setDebouncedProvSearch] = useState('');
  const [provDropOpen, setProvDropOpen] = useState(false);
  const provRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedProvSearch(provSearch), 400);
    return () => clearTimeout(t);
  }, [provSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (provRef.current && !provRef.current.contains(e.target as Node)) setProvDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: provData } = useQuery({
    queryKey: ['proveedores-search', debouncedProvSearch],
    queryFn: () => getProveedores({ search: debouncedProvSearch, limit: 10 }),
    enabled: provDropOpen && debouncedProvSearch.length >= 2,
  });

  const { data: monedasData } = useQuery({
    queryKey: ['monedas-all'],
    queryFn: getMonedas,
  });
  const monedas = monedasData ?? [];

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const updateLine = (idx: number, field: keyof ContratoProvDet, value: string | number | null) => {
    setDetalle((prev) => {
      const updated = [...prev];
      const line = { ...updated[idx], [field]: value };
      const cant = Number(line.cond_cant) || 0;
      const precio = Number(line.cond_precio) || 0;
      line.cond_imp_total = cant * precio;
      updated[idx] = line;
      return updated;
    });
  };

  const addLine = () => setDetalle((prev) => [...prev, emptyLine()]);
  const removeLine = (idx: number) => setDetalle((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const totalContrato = detalle.reduce((sum, d) => sum + (Number(d.cond_imp_total) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cont_fecha) { setLocalError('La fecha es requerida'); return; }
    setLocalError('');
    onSubmit({
      cont_prov:         form.cont_prov         ? Number(form.cont_prov) : null,
      cont_fecha:        form.cont_fecha,
      cont_mon:          form.cont_mon           ? Number(form.cont_mon) : null,
      cont_imp_total:    totalContrato,
      cont_ind_interno:  form.cont_ind_interno   || 'N',
      cont_ind_anterior: form.cont_ind_anterior  || 'N',
      cont_ind_vigente:  form.cont_ind_vigente   || 'S',
      cont_obs:          form.cont_obs           || null,
      detalle: detalle.filter((d) => d.cond_cant > 0 || d.cond_precio > 0),
    });
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos del contrato</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
            <input type="date" value={form.cont_fecha} onChange={(e) => set('cont_fecha', e.target.value)}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select value={form.cont_mon} onChange={(e) => set('cont_mon', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Sin moneda —</option>
              {monedas.map((m) => <option key={m.mon_codigo} value={m.mon_codigo}>{m.mon_desc}</option>)}
            </select>
          </div>

          {/* Vigente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vigente</label>
            <select value={form.cont_ind_vigente} onChange={(e) => set('cont_ind_vigente', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="S">Sí</option>
              <option value="N">No</option>
            </select>
          </div>

          {/* Proveedor */}
          <div className="sm:col-span-2" ref={provRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={provSearch}
                onChange={(e) => { setProvSearch(e.target.value); setProvDropOpen(true); if (!e.target.value) set('cont_prov', ''); }}
                onFocus={() => setProvDropOpen(true)}
                placeholder="Buscar proveedor..."
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {provDropOpen && provSearch.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {(provData?.data ?? []).length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                  ) : (
                    (provData?.data ?? []).map((p: Proveedor) => (
                      <button key={p.prov_codigo} type="button"
                        onClick={() => { set('cont_prov', String(p.prov_codigo)); setProvSearch(p.prov_razon_social); setProvDropOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700">
                        <span className="font-medium">{p.prov_razon_social}</span>
                        {p.prov_ruc && <span className="text-gray-400 ml-2 text-xs">{p.prov_ruc}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Interno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interno</label>
            <select value={form.cont_ind_interno} onChange={(e) => set('cont_ind_interno', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="N">No</option>
              <option value="S">Sí</option>
            </select>
          </div>

          {/* Observaciones */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <input value={form.cont_obs} onChange={(e) => set('cont_obs', e.target.value)}
              placeholder="Notas adicionales"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      {/* Detalle */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Detalle del contrato</h2>
          <button type="button" onClick={addLine}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
            <Plus size={16} /> Agregar línea
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                <th className="py-2 px-2 w-8">#</th>
                <th className="py-2 px-2 w-28">Desde</th>
                <th className="py-2 px-2 w-28">Hasta</th>
                <th className="py-2 px-2 w-20">U.M.</th>
                <th className="py-2 px-2 w-24 text-right">Cantidad</th>
                <th className="py-2 px-2 w-28 text-right">Precio</th>
                <th className="py-2 px-2 w-28 text-right">Total</th>
                <th className="py-2 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((d, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 px-2 text-xs text-gray-400">{idx + 1}</td>
                  <td className="py-2 px-2">
                    <input type="date" value={d.cond_fec_ini ?? ''} onChange={(e) => updateLine(idx, 'cond_fec_ini', e.target.value || null)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2">
                    <input type="date" value={d.cond_fec_fin ?? ''} onChange={(e) => updateLine(idx, 'cond_fec_fin', e.target.value || null)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2">
                    <input value={d.cond_un_med ?? ''} onChange={(e) => updateLine(idx, 'cond_un_med', e.target.value)}
                      placeholder="MES"
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" min="0" step="0.01" value={d.cond_cant || ''} onChange={(e) => updateLine(idx, 'cond_cant', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" min="0" step="0.01" value={d.cond_precio || ''} onChange={(e) => updateLine(idx, 'cond_precio', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-gray-700">{fmt(d.cond_imp_total)}</td>
                  <td className="py-2 px-2">
                    <button type="button" onClick={() => removeLine(idx)}
                      className="text-gray-400 hover:text-red-500 transition" title="Eliminar línea">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={6} className="py-3 px-2 text-right font-semibold text-gray-700">Total contrato</td>
                <td className="py-3 px-2 text-right font-semibold tabular-nums text-gray-900">{fmt(totalContrato)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {displayError && <p className="text-sm text-red-600">{displayError}</p>}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
