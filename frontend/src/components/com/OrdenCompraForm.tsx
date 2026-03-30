'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProveedores } from '@/services/fin';
import { getMonedas } from '@/services/gen';
import type { OrdenCompra, OrdenCompraDet } from '@/types/com';
import type { Proveedor } from '@/types/fin';
import { Search, Plus, Trash2 } from 'lucide-react';
import { toInputDate } from '@/lib/utils';

interface Props {
  initialData?: OrdenCompra;
  isPending: boolean;
  error: string;
  onSubmit: (data: Partial<OrdenCompra>) => void;
  onCancel: () => void;
}

const ESTADOS: Record<string, string> = { PE: 'Pendiente', AU: 'Autorizada', AN: 'Anulada' };

const emptyLine = (): OrdenCompraDet => ({
  orcomdet_tipo_mov: null,
  orcomdet_art: null,
  orcomdet_art_desc: '',
  orcomdet_art_unid_med: null,
  orcomdet_cant: 0,
  orcomdet_precio_unit: 0,
  orcomdet_impu_codigo: null,
  orcomdet_exenta: 0,
  orcomdet_gravada: 0,
  orcomdet_impuesto: 0,
  orcomdet_total: 0,
  orcomdet_desc_larga: null,
});

const fmt = (n: number | null | undefined) =>
  n == null ? '' : new Intl.NumberFormat('es-PY').format(Number(n));

export default function OrdenCompraForm({ initialData, isPending, error, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    orcom_fec_emis:      initialData?.orcom_fec_emis      ? toInputDate(initialData.orcom_fec_emis) : new Date().toISOString().split('T')[0],
    orcom_prov:          initialData?.orcom_prov?.toString() ?? '',
    orcom_dpto_solicita: initialData?.orcom_dpto_solicita?.toString() ?? '',
    orcom_responsable:   initialData?.orcom_responsable?.toString() ?? '',
    orcom_cliente:       initialData?.orcom_cliente ?? '',
    orcom_mon:           initialData?.orcom_mon?.toString() ?? '',
    orcom_tasa:          initialData?.orcom_tasa?.toString() ?? '',
    orcom_estado:        initialData?.orcom_estado ?? 'PE',
    orcom_obs:           initialData?.orcom_obs ?? '',
    orcom_forma_pago:    initialData?.orcom_forma_pago ?? '',
    orcom_fec_vto:       initialData?.orcom_fec_vto ? toInputDate(initialData.orcom_fec_vto) : '',
  });
  const [detalle, setDetalle] = useState<OrdenCompraDet[]>(
    initialData?.detalle?.length ? initialData.detalle : [emptyLine()]
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

  // Detalle helpers
  const updateLine = (idx: number, field: keyof OrdenCompraDet, value: string | number | null) => {
    setDetalle((prev) => {
      const updated = [...prev];
      const line = { ...updated[idx], [field]: value };
      // Recalcular totales de línea
      const cant = Number(line.orcomdet_cant) || 0;
      const precio = Number(line.orcomdet_precio_unit) || 0;
      const subtotal = cant * precio;
      const impuCod = Number(line.orcomdet_impu_codigo) || 0;
      if (impuCod === 0) {
        line.orcomdet_exenta = subtotal;
        line.orcomdet_gravada = 0;
        line.orcomdet_impuesto = 0;
      } else {
        line.orcomdet_exenta = 0;
        line.orcomdet_gravada = subtotal;
        const tasa = impuCod === 1 ? 10 : impuCod === 2 ? 5 : 0;
        line.orcomdet_impuesto = Math.round(subtotal * tasa / (100 + tasa));
      }
      line.orcomdet_total = subtotal;
      updated[idx] = line;
      return updated;
    });
  };

  const addLine = () => setDetalle((prev) => [...prev, emptyLine()]);
  const removeLine = (idx: number) => setDetalle((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const totalOrden = detalle.reduce((sum, d) => sum + (Number(d.orcomdet_total) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orcom_fec_emis) { setLocalError('La fecha es requerida'); return; }
    setLocalError('');
    onSubmit({
      orcom_fec_emis:      form.orcom_fec_emis,
      orcom_prov:          form.orcom_prov          ? Number(form.orcom_prov) : null,
      orcom_dpto_solicita: form.orcom_dpto_solicita ? Number(form.orcom_dpto_solicita) : null,
      orcom_responsable:   form.orcom_responsable   ? Number(form.orcom_responsable) : null,
      orcom_cliente:       form.orcom_cliente        || null,
      orcom_mon:           form.orcom_mon            ? Number(form.orcom_mon) : null,
      orcom_tasa:          form.orcom_tasa           ? Number(form.orcom_tasa) : null,
      orcom_total:         totalOrden,
      orcom_estado:        form.orcom_estado         || 'PE',
      orcom_obs:           form.orcom_obs            || null,
      orcom_forma_pago:    form.orcom_forma_pago     || null,
      orcom_fec_vto:       form.orcom_fec_vto        || null,
      detalle: detalle.filter((d) => d.orcomdet_art_desc),
    });
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos generales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha emisión <span className="text-red-500">*</span></label>
            <input type="date" value={form.orcom_fec_emis} onChange={(e) => set('orcom_fec_emis', e.target.value)}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.orcom_estado} onChange={(e) => set('orcom_estado', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select value={form.orcom_mon} onChange={(e) => set('orcom_mon', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Sin moneda —</option>
              {monedas.map((m) => <option key={m.mon_codigo} value={m.mon_codigo}>{m.mon_desc}</option>)}
            </select>
          </div>

          {/* Proveedor */}
          <div className="sm:col-span-2" ref={provRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={provSearch}
                onChange={(e) => { setProvSearch(e.target.value); setProvDropOpen(true); if (!e.target.value) set('orcom_prov', ''); }}
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
                        onClick={() => { set('orcom_prov', String(p.prov_codigo)); setProvSearch(p.prov_razon_social); setProvDropOpen(false); }}
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

          {/* Tasa cambio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de cambio</label>
            <input type="number" min="0" step="0.0001" value={form.orcom_tasa} onChange={(e) => set('orcom_tasa', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Forma de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pago</label>
            <input value={form.orcom_forma_pago} onChange={(e) => set('orcom_forma_pago', e.target.value)}
              placeholder="Ej: CREDITO 30 DIAS"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Fecha vencimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha vencimiento</label>
            <input type="date" value={form.orcom_fec_vto} onChange={(e) => set('orcom_fec_vto', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Cliente (referencia) */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (referencia)</label>
            <input value={form.orcom_cliente} onChange={(e) => set('orcom_cliente', e.target.value)}
              placeholder="Cliente relacionado a la compra"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Observaciones */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <input value={form.orcom_obs} onChange={(e) => set('orcom_obs', e.target.value)}
              placeholder="Notas adicionales"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      {/* Detalle */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Detalle de artículos</h2>
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
                <th className="py-2 px-2">Descripción</th>
                <th className="py-2 px-2 w-20">U.M.</th>
                <th className="py-2 px-2 w-24 text-right">Cantidad</th>
                <th className="py-2 px-2 w-28 text-right">Precio unit.</th>
                <th className="py-2 px-2 w-28 text-right">Total</th>
                <th className="py-2 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((d, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 px-2 text-xs text-gray-400">{idx + 1}</td>
                  <td className="py-2 px-2">
                    <input value={d.orcomdet_art_desc ?? ''} onChange={(e) => updateLine(idx, 'orcomdet_art_desc', e.target.value)}
                      placeholder="Descripción del artículo"
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2">
                    <input value={d.orcomdet_art_unid_med ?? ''} onChange={(e) => updateLine(idx, 'orcomdet_art_unid_med', e.target.value)}
                      placeholder="UN"
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" min="0" step="0.01" value={d.orcomdet_cant || ''} onChange={(e) => updateLine(idx, 'orcomdet_cant', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" min="0" step="0.01" value={d.orcomdet_precio_unit || ''} onChange={(e) => updateLine(idx, 'orcomdet_precio_unit', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-gray-700">{fmt(d.orcomdet_total)}</td>
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
                <td colSpan={5} className="py-3 px-2 text-right font-semibold text-gray-700">Total orden</td>
                <td className="py-3 px-2 text-right font-semibold tabular-nums text-gray-900">{fmt(totalOrden)}</td>
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
