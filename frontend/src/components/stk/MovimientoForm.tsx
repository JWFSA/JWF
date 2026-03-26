'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getOperaciones, getDepositos, getArticulos } from '@/services/stk';
import type { Movimiento, MovimientoDetalle, Operacion, Articulo } from '@/types/stk';
import { Search, Plus, Trash2 } from 'lucide-react';

interface Props {
  initial?: Partial<Movimiento>;
  onSave: (data: Partial<Movimiento>) => Promise<void>;
  isPending: boolean;
  error?: string;
}

const empty: Partial<Movimiento> = {
  docu_fec_emis: new Date().toISOString().split('T')[0],
  docu_tipo_mov: undefined,
  docu_dep_orig: undefined,
  docu_dep_dest: undefined,
  docu_obs: '',
  items: [],
};

export default function MovimientoForm({ initial, onSave, isPending, error }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Movimiento>>({
    ...empty,
    ...initial,
    docu_fec_emis: initial?.docu_fec_emis
      ? initial.docu_fec_emis.toString().substring(0, 10)
      : empty.docu_fec_emis,
  });
  const [items, setItems] = useState<MovimientoDetalle[]>(initial?.items ?? []);

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

  const { data: operaciones = [] } = useQuery<Operacion[]>({
    queryKey: ['operaciones'],
    queryFn: getOperaciones,
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

  const set = (k: keyof Movimiento, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const addArticulo = (art: Articulo) => {
    setItems((prev) => [
      ...prev,
      {
        deta_clave_doc: 0,
        deta_nro_item: prev.length + 1,
        deta_art: art.art_codigo,
        art_desc: art.art_desc,
        art_unid_med: art.art_unid_med,
        deta_cant: 1,
      },
    ]);
    setArtSearch('');
    setArtDropOpen(false);
  };

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof MovimientoDetalle, value: unknown) => {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...form, items });
  };

  // Operación seleccionada para mostrar info
  const operSelected = operaciones.find((o) => o.oper_codigo === Number(form.docu_tipo_mov));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Datos del movimiento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.docu_fec_emis ?? ''}
              onChange={(e) => set('docu_fec_emis', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento <span className="text-red-500">*</span></label>
            <select
              value={form.docu_tipo_mov ?? ''}
              onChange={(e) => set('docu_tipo_mov', e.target.value ? Number(e.target.value) : undefined)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Seleccione —</option>
              {operaciones.map((o) => (
                <option key={o.oper_codigo} value={o.oper_codigo}>
                  {o.oper_desc} ({o.oper_ent_sal === 'E' ? 'Entrada' : 'Salida'})
                </option>
              ))}
            </select>
            {operSelected && (
              <p className="mt-1 text-xs text-gray-400">
                {operSelected.oper_ent_sal === 'E' ? '↑ Entrada de stock' : '↓ Salida de stock'}
              </p>
            )}
          </div>

          {/* Depósito origen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Depósito origen <span className="text-red-500">*</span></label>
            <select
              value={form.docu_dep_orig ?? ''}
              onChange={(e) => set('docu_dep_orig', e.target.value ? Number(e.target.value) : undefined)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Seleccione —</option>
              {depositos.map((d) => (
                <option key={d.dep_codigo} value={d.dep_codigo}>{d.dep_desc}</option>
              ))}
            </select>
          </div>

          {/* Depósito destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Depósito destino</label>
            <select
              value={form.docu_dep_dest ?? ''}
              onChange={(e) => set('docu_dep_dest', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Sin destino —</option>
              {depositos.map((d) => (
                <option key={d.dep_codigo} value={d.dep_codigo}>{d.dep_desc}</option>
              ))}
            </select>
          </div>

          {/* Observaciones */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <input
              value={form.docu_obs ?? ''}
              onChange={(e) => set('docu_obs', e.target.value)}
              placeholder="Notas adicionales..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Artículos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Artículos</h2>

        {/* Buscador de artículos */}
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

        {/* Tabla de ítems */}
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
                        value={it.deta_cant}
                        onChange={(e) => updateItem(idx, 'deta_cant', parseFloat(e.target.value) || 0)}
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

      {/* Error + acciones */}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
          {isPending ? 'Guardando…' : 'Guardar movimiento'}
        </button>
      </div>
    </form>
  );
}
