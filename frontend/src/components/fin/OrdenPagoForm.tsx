'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getProveedores, getCuentasBancarias, getFormasPago } from '@/services/fin';
import { getMonedas } from '@/services/gen';
import type { OrdenPago, Proveedor } from '@/types/fin';
import { Search } from 'lucide-react';
import { toInputDate } from '@/lib/utils';

interface Props {
  initialData?: OrdenPago;
  isPending: boolean;
  error: string;
  onSubmit: (data: Partial<OrdenPago>) => void;
  onCancel: () => void;
}

const ESTADOS: Record<string, string> = { P: 'Pendiente', A: 'Aprobada', C: 'Completada', X: 'Anulada' };

export default function OrdenPagoForm({ initialData, isPending, error, onSubmit, onCancel }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    ordp_fec_orden:    initialData?.ordp_fec_orden    ? toInputDate(initialData.ordp_fec_orden) : new Date().toISOString().split('T')[0],
    ordp_beneficiario: initialData?.ordp_beneficiario ?? '',
    ordp_prov:         initialData?.ordp_prov?.toString() ?? '',
    ordp_cta_bco:      initialData?.ordp_cta_bco?.toString() ?? '',
    ordp_nro_cta_banc: initialData?.ordp_nro_cta_banc ?? '',
    ordp_fcon_codigo:  initialData?.ordp_fcon_codigo?.toString() ?? '',
    ordp_mon:          initialData?.ordp_mon?.toString() ?? '',
    ordp_cheq_nro:     initialData?.ordp_cheq_nro ?? '',
    ordp_cheq_fec:     initialData?.ordp_cheq_fec ? toInputDate(initialData.ordp_cheq_fec) : '',
    ordp_cheq_importe: initialData?.ordp_cheq_importe?.toString() ?? '',
    ordp_tot_pago:     initialData?.ordp_tot_pago?.toString() ?? '',
    ordp_estado:       initialData?.ordp_estado ?? 'P',
    ordp_obs:          initialData?.ordp_obs ?? '',
  });
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

  const { data: cuentasData } = useQuery({
    queryKey: ['cuentas-bancarias', { all: true }],
    queryFn: () => getCuentasBancarias({ all: true }),
  });
  const { data: formasData } = useQuery({
    queryKey: ['formas-pago', { all: true }],
    queryFn: () => getFormasPago({ all: true }),
  });
  const { data: monedasData } = useQuery({
    queryKey: ['monedas-all'],
    queryFn: getMonedas,
  });

  const cuentas = cuentasData?.data ?? [];
  const formas  = formasData?.data ?? [];
  const monedas = monedasData ?? [];

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ordp_fec_orden) { setLocalError('La fecha es requerida'); return; }
    setLocalError('');
    onSubmit({
      ordp_fec_orden:    form.ordp_fec_orden,
      ordp_beneficiario: form.ordp_beneficiario || null,
      ordp_prov:         form.ordp_prov        ? Number(form.ordp_prov) : null,
      ordp_cta_bco:      form.ordp_cta_bco     ? Number(form.ordp_cta_bco) : null,
      ordp_nro_cta_banc: form.ordp_nro_cta_banc || null,
      ordp_fcon_codigo:  form.ordp_fcon_codigo  ? Number(form.ordp_fcon_codigo) : null,
      ordp_mon:          form.ordp_mon          ? Number(form.ordp_mon) : null,
      ordp_cheq_nro:     form.ordp_cheq_nro     || null,
      ordp_cheq_fec:     form.ordp_cheq_fec     || null,
      ordp_cheq_importe: form.ordp_cheq_importe ? Number(form.ordp_cheq_importe) : null,
      ordp_tot_pago:     form.ordp_tot_pago     ? Number(form.ordp_tot_pago) : null,
      ordp_estado:       form.ordp_estado       || 'P',
      ordp_obs:          form.ordp_obs          || null,
    });
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
          <input type="date" value={form.ordp_fec_orden} onChange={(e) => set('ordp_fec_orden', e.target.value)}
            required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select value={form.ordp_estado} onChange={(e) => set('ordp_estado', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Beneficiario */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiario</label>
          <input value={form.ordp_beneficiario} onChange={(e) => set('ordp_beneficiario', e.target.value)}
            placeholder="Nombre del beneficiario"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Proveedor (búsqueda) */}
        <div className="sm:col-span-2" ref={provRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={provSearch}
              onChange={(e) => { setProvSearch(e.target.value); setProvDropOpen(true); if (!e.target.value) set('ordp_prov', ''); }}
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
                      onClick={() => { set('ordp_prov', String(p.prov_codigo)); setProvSearch(p.prov_razon_social); setProvDropOpen(false); }}
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

        {/* Moneda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
          <select value={form.ordp_mon} onChange={(e) => set('ordp_mon', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Sin moneda —</option>
            {monedas.map((m) => <option key={m.mon_codigo} value={m.mon_codigo}>{m.mon_desc}</option>)}
          </select>
        </div>

        {/* Forma de pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pago</label>
          <select value={form.ordp_fcon_codigo} onChange={(e) => set('ordp_fcon_codigo', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Sin forma de pago —</option>
            {formas.map((f) => <option key={f.fpag_codigo} value={f.fpag_codigo}>{f.fpag_desc}</option>)}
          </select>
        </div>

        {/* Cuenta bancaria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta bancaria</label>
          <select value={form.ordp_cta_bco} onChange={(e) => set('ordp_cta_bco', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Sin cuenta —</option>
            {cuentas.map((c) => <option key={c.cta_codigo} value={c.cta_codigo}>{c.cta_desc}</option>)}
          </select>
        </div>

        {/* Nro cuenta bancaria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nro. cuenta bancaria</label>
          <input value={form.ordp_nro_cta_banc} onChange={(e) => set('ordp_nro_cta_banc', e.target.value)}
            placeholder="Número de cuenta"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Cheque nro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nro. cheque</label>
          <input value={form.ordp_cheq_nro} onChange={(e) => set('ordp_cheq_nro', e.target.value)}
            placeholder="Número de cheque"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Cheque fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha cheque</label>
          <input type="date" value={form.ordp_cheq_fec} onChange={(e) => set('ordp_cheq_fec', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Importe cheque */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Importe cheque</label>
          <input type="number" min="0" step="0.01" value={form.ordp_cheq_importe} onChange={(e) => set('ordp_cheq_importe', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Total a pagar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total a pagar</label>
          <input type="number" min="0" step="0.01" value={form.ordp_tot_pago} onChange={(e) => set('ordp_tot_pago', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Observaciones */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <input value={form.ordp_obs} onChange={(e) => set('ordp_obs', e.target.value)}
            placeholder="Notas adicionales"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      {displayError && <p className="mt-4 text-sm text-red-600">{displayError}</p>}

      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
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
