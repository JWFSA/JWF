'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getClientes, getVendedores, getCondiciones, getArticulos } from '@/services/fac';
import type { Pedido, PedidoDet, Articulo } from '@/types/fac';
import { Search, Plus, Trash2 } from 'lucide-react';

interface Props {
  initial?: Partial<Pedido>;
  onSave: (data: Partial<Pedido>) => Promise<void>;
  isPending: boolean;
  error?: string;
  tipo?: 'V' | 'P';
}

const empty: Partial<Pedido> = {
  ped_fecha: new Date().toISOString().split('T')[0],
  ped_cli: undefined as unknown as number,
  ped_vendedor: null,
  ped_cond_venta: '',
  ped_mon: 1,
  ped_producto: '',
  ped_concepto: '',
  ped_obs: '',
  ped_estado: 'P',
  items: [],
};

export default function PedidoForm({ initial, onSave, isPending, error, tipo = 'V' }: Props) {
  const label = tipo === 'P' ? 'presupuesto' : 'pedido';
  const labelCap = tipo === 'P' ? 'Presupuesto' : 'Pedido';
  const router = useRouter();
  const [form, setForm] = useState<Partial<Pedido>>({ ...empty, ...initial });
  const [items, setItems] = useState<PedidoDet[]>(initial?.items ?? []);

  // Article search state
  const [artSearch, setArtSearch] = useState('');
  const [debouncedArtSearch, setDebouncedArtSearch] = useState('');
  const [artDropOpen, setArtDropOpen] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);

  // Client search state
  const [cliSearch, setCliSearch] = useState(initial?.cli_nom ?? '');
  const [debouncedCliSearch, setDebouncedCliSearch] = useState('');
  const [cliDropOpen, setCliDropOpen] = useState(false);
  const cliRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedArtSearch(artSearch), 400);
    return () => clearTimeout(t);
  }, [artSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCliSearch(cliSearch), 400);
    return () => clearTimeout(t);
  }, [cliSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (artRef.current && !artRef.current.contains(e.target as Node)) setArtDropOpen(false);
      if (cliRef.current && !cliRef.current.contains(e.target as Node)) setCliDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: cliData } = useQuery({
    queryKey: ['clientes-search', debouncedCliSearch],
    queryFn: () => getClientes({ search: debouncedCliSearch, limit: 10 }),
    enabled: cliDropOpen && debouncedCliSearch.length >= 2,
  });

  const { data: condData } = useQuery({
    queryKey: ['condiciones'],
    queryFn: getCondiciones,
  });

  const { data: vendData } = useQuery({
    queryKey: ['vendedores', { all: true }],
    queryFn: () => getVendedores({ all: true }),
  });

  const { data: artData } = useQuery({
    queryKey: ['articulos-search', debouncedArtSearch],
    queryFn: () => getArticulos({ search: debouncedArtSearch, limit: 10 }),
    enabled: artDropOpen && debouncedArtSearch.length >= 2,
  });

  const set = (k: keyof Pedido, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const addArticulo = (art: Articulo) => {
    setItems((prev) => [
      ...prev,
      {
        pdet_art: art.art_codigo,
        art_desc: art.art_desc,
        art_unid_med: art.art_unid_med,
        pdet_um_ped: art.art_unid_med || 'U',
        pdet_cant_ped: 1,
        pdet_precio: 0,
        pdet_porc_dcto: 0,
        pdet_desc_larga: art.art_desc,
      },
    ]);
    setArtSearch('');
    setArtDropOpen(false);
  };

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof PedidoDet, value: unknown) => {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const calcNeto = (it: PedidoDet) =>
    parseFloat(String(it.pdet_cant_ped || 0)) * parseFloat(String(it.pdet_precio || 0)) * (1 - parseFloat(String(it.pdet_porc_dcto || 0)) / 100);

  const total = items.reduce((s, it) => s + calcNeto(it), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...form, items });
  };

  const vendedores = vendData?.data ?? [];
  const condiciones = condData ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Datos del {label}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
            <input type="date" value={form.ped_fecha ?? ''} onChange={(e) => set('ped_fecha', e.target.value)}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.ped_estado ?? 'P'} onChange={(e) => set('ped_estado', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="P">Pendiente</option>
              <option value="A">Aprobado</option>
              <option value="C">Cerrado</option>
            </select>
          </div>

          {/* Condición de venta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condición de venta</label>
            <select value={form.ped_cond_venta ?? ''} onChange={(e) => set('ped_cond_venta', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Sin condición —</option>
              {condiciones.map((c) => (
                <option key={c.con_desc} value={c.con_desc}>{c.con_desc}</option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div className="sm:col-span-2" ref={cliRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente <span className="text-red-500">*</span></label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={cliSearch}
                onChange={(e) => { setCliSearch(e.target.value); setCliDropOpen(true); if (!e.target.value) { set('ped_cli', undefined as unknown as number); } }}
                onFocus={() => setCliDropOpen(true)}
                placeholder="Buscar cliente por nombre o RUC..."
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {cliDropOpen && cliSearch.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {(cliData?.data ?? []).length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                  ) : (
                    (cliData?.data ?? []).map((c) => (
                      <button key={c.cli_codigo} type="button"
                        onClick={() => { set('ped_cli', c.cli_codigo); setCliSearch(c.cli_nom); setCliDropOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700">
                        <span className="font-medium">{c.cli_nom}</span>
                        {c.cli_ruc && <span className="text-gray-400 ml-2 text-xs">{c.cli_ruc}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Vendedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
            <select value={form.ped_vendedor ?? ''} onChange={(e) => set('ped_vendedor', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Sin vendedor —</option>
              {vendedores.map((v) => (
                <option key={v.vend_legajo} value={v.vend_legajo}>
                  {v.oper_nombre} {v.oper_apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Producto */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto / Descripción</label>
            <input value={form.ped_producto ?? ''} onChange={(e) => set('ped_producto', e.target.value)}
              placeholder={`Descripción general del ${label}`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
            <input value={form.ped_concepto ?? ''} onChange={(e) => set('ped_concepto', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Observaciones */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea value={form.ped_obs ?? ''} onChange={(e) => set('ped_obs', e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Items del {label}</h2>
        </div>

        {/* Article search */}
        <div className="mb-4" ref={artRef}>
          <div className="relative">
            <Plus size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={artSearch}
              onChange={(e) => { setArtSearch(e.target.value); setArtDropOpen(true); }}
              onFocus={() => setArtDropOpen(true)}
              placeholder="Buscar artículo para agregar..."
              className="w-full sm:w-96 pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {artDropOpen && artSearch.length >= 2 && (
              <div className="absolute z-10 w-full sm:w-96 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {(artData?.data ?? []).length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                ) : (
                  (artData?.data ?? []).map((a) => (
                    <button key={a.art_codigo} type="button"
                      onClick={() => addArticulo(a)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700">
                      <span className="font-medium">{a.art_desc}</span>
                      <span className="text-gray-400 ml-2 text-xs">{a.art_unid_med}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Items table */}
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left pb-2 pr-3">Artículo</th>
                  <th className="text-left pb-2 pr-3 w-20">UM</th>
                  <th className="text-right pb-2 pr-3 w-24">Cantidad</th>
                  <th className="text-right pb-2 pr-3 w-28">Precio</th>
                  <th className="text-right pb-2 pr-3 w-20">% Dto.</th>
                  <th className="text-right pb-2 pr-3 w-28">Neto</th>
                  <th className="w-8 pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="py-1.5 pr-3">
                      <div className="font-medium text-gray-800 text-xs">{it.art_desc}</div>
                      {it.pdet_desc_larga && it.pdet_desc_larga !== it.art_desc && (
                        <input value={it.pdet_desc_larga ?? ''} onChange={(e) => updateItem(idx, 'pdet_desc_larga', e.target.value)}
                          className="w-full mt-0.5 border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-400" />
                      )}
                    </td>
                    <td className="py-1.5 pr-3">
                      <input value={it.pdet_um_ped} onChange={(e) => updateItem(idx, 'pdet_um_ped', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary-400" />
                    </td>
                    <td className="py-1.5 pr-3">
                      <input type="number" min="0" step="0.01" value={it.pdet_cant_ped}
                        onChange={(e) => updateItem(idx, 'pdet_cant_ped', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400" />
                    </td>
                    <td className="py-1.5 pr-3">
                      <input type="number" min="0" step="0.01" value={it.pdet_precio}
                        onChange={(e) => updateItem(idx, 'pdet_precio', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400" />
                    </td>
                    <td className="py-1.5 pr-3">
                      <input type="number" min="0" max="100" step="0.01" value={it.pdet_porc_dcto}
                        onChange={(e) => updateItem(idx, 'pdet_porc_dcto', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400" />
                    </td>
                    <td className="py-1.5 pr-3 text-right text-gray-700 tabular-nums">
                      {new Intl.NumberFormat('es-PY').format(calcNeto(it))}
                    </td>
                    <td className="py-1.5">
                      <button type="button" onClick={() => removeItem(idx)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={5} className="pt-2 pr-3 text-right text-sm font-semibold text-gray-700">Total:</td>
                  <td className="pt-2 pr-3 text-right text-sm font-bold text-gray-900 tabular-nums">
                    {new Intl.NumberFormat('es-PY').format(total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No hay artículos. Busca arriba para agregar.</p>
        )}
      </div>

      {/* Error + actions */}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
          {isPending ? 'Guardando…' : `Guardar ${label}`}
        </button>
      </div>
    </form>
  );
}
