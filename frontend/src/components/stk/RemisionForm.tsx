'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getDepositos, getArticulos } from '@/services/stk';
import { getClientes } from '@/services/fac';
import type { Remision, RemisionDetalle, Articulo } from '@/types/stk';
import { Search, Plus, Trash2 } from 'lucide-react';

interface Props {
  initial?: Partial<Remision>;
  onSave: (data: Partial<Remision>) => Promise<void>;
  isPending: boolean;
  error?: string;
}

const empty: Partial<Remision> = {
  rem_fec_emis: new Date().toISOString().split('T')[0],
  rem_cli: undefined,
  rem_cli_nom: '',
  rem_dep: undefined,
  rem_dep_dest: undefined,
  rem_obs: '',
  rem_nro_timbrado: '',
  items: [],
};

export default function RemisionForm({ initial, onSave, isPending, error }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Remision>>({
    ...empty,
    ...initial,
    rem_fec_emis: initial?.rem_fec_emis
      ? initial.rem_fec_emis.toString().substring(0, 10)
      : empty.rem_fec_emis,
  });
  const [items, setItems] = useState<RemisionDetalle[]>(initial?.items ?? []);

  // Cliente search
  const [cliSearch, setCliSearch] = useState(initial?.cli_nom ?? '');
  const [debouncedCliSearch, setDebouncedCliSearch] = useState('');
  const [cliDropOpen, setCliDropOpen] = useState(false);
  const cliRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCliSearch(cliSearch), 400);
    return () => clearTimeout(t);
  }, [cliSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cliRef.current && !cliRef.current.contains(e.target as Node)) setCliDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Artículo search
  const [artSearch, setArtSearch] = useState('');
  const [debouncedArtSearch, setDebouncedArtSearch] = useState('');
  const [artDropOpen, setArtDropOpen] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedArtSearch(artSearch), 400);
    return () => clearTimeout(t);
  }, [artSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (artRef.current && !artRef.current.contains(e.target as Node)) setArtDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: cliData } = useQuery({
    queryKey: ['clientes-search', debouncedCliSearch],
    queryFn: () => getClientes({ search: debouncedCliSearch, limit: 10 }),
    enabled: cliDropOpen && debouncedCliSearch.length >= 2,
  });

  const { data: depositosData } = useQuery({
    queryKey: ['depositos', { all: true }],
    queryFn: () => getDepositos({ all: true }),
  });
  const depositos = depositosData?.data ?? [];

  const { data: artData } = useQuery({
    queryKey: ['articulos-search', debouncedArtSearch],
    queryFn: () => getArticulos({ search: debouncedArtSearch, limit: 10 }),
    enabled: artDropOpen && debouncedArtSearch.length >= 2,
  });

  const set = (k: keyof Remision, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const addArticulo = (art: Articulo) => {
    setItems((prev) => [
      ...prev,
      {
        detr_nro_item: prev.length + 1,
        detr_art: art.art_codigo,
        art_desc: art.art_desc,
        art_unid_med: art.art_unid_med,
        detr_cant_rem: 1,
      },
    ]);
    setArtSearch('');
    setArtDropOpen(false);
  };

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof RemisionDetalle, value: unknown) => {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...form, items });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Datos de la remisión</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.rem_fec_emis ?? ''}
              onChange={(e) => set('rem_fec_emis', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Nro. Timbrado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nro. Timbrado</label>
            <input
              value={form.rem_nro_timbrado ?? ''}
              onChange={(e) => set('rem_nro_timbrado', e.target.value)}
              placeholder="Número de timbrado"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Depósito origen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Depósito origen</label>
            <select
              value={form.rem_dep ?? ''}
              onChange={(e) => set('rem_dep', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Sin depósito —</option>
              {depositos.map((d) => (
                <option key={d.dep_codigo} value={d.dep_codigo}>{d.dep_desc}</option>
              ))}
            </select>
          </div>

          {/* Depósito destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Depósito destino</label>
            <select
              value={form.rem_dep_dest ?? ''}
              onChange={(e) => set('rem_dep_dest', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Sin destino —</option>
              {depositos.map((d) => (
                <option key={d.dep_codigo} value={d.dep_codigo}>{d.dep_desc}</option>
              ))}
            </select>
          </div>

          {/* Cliente (búsqueda) */}
          <div className="sm:col-span-2" ref={cliRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={cliSearch}
                onChange={(e) => { setCliSearch(e.target.value); setCliDropOpen(true); if (!e.target.value) set('rem_cli', undefined); }}
                onFocus={() => setCliDropOpen(true)}
                placeholder="Buscar cliente..."
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {cliDropOpen && cliSearch.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {(cliData?.data ?? []).length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                  ) : (
                    (cliData?.data ?? []).map((c) => (
                      <button key={c.cli_codigo} type="button"
                        onClick={() => { set('rem_cli', c.cli_codigo); setCliSearch(c.cli_nom); setCliDropOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700">
                        <span className="font-medium">{c.cli_nom}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Nombre cliente manual */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en remisión</label>
            <input
              value={form.rem_cli_nom ?? ''}
              onChange={(e) => set('rem_cli_nom', e.target.value)}
              placeholder="Nombre a imprimir (opcional, si difiere del cliente)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Observaciones */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <input
              value={form.rem_obs ?? ''}
              onChange={(e) => set('rem_obs', e.target.value)}
              placeholder="Notas adicionales..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Artículos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Artículos</h2>

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
                      {a.art_unid_med && <span className="text-gray-400 ml-2 text-xs">{a.art_unid_med}</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left pb-2 pr-3">Artículo</th>
                  <th className="text-left pb-2 pr-3 w-20">UM</th>
                  <th className="text-right pb-2 pr-3 w-28">Cantidad</th>
                  <th className="w-8 pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="py-1.5 pr-3 font-medium text-gray-800 text-xs">{it.art_desc}</td>
                    <td className="py-1.5 pr-3 text-xs text-gray-500">{it.art_unid_med ?? '—'}</td>
                    <td className="py-1.5 pr-3">
                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={it.detr_cant_rem}
                        onChange={(e) => updateItem(idx, 'detr_cant_rem', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
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
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No hay artículos. Busca arriba para agregar.</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
          {isPending ? 'Guardando…' : 'Guardar remisión'}
        </button>
      </div>
    </form>
  );
}
