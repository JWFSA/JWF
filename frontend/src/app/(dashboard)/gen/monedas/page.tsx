'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMonedas, createMoneda, updateMoneda, deleteMoneda } from '@/services/gen';
import type { Moneda } from '@/types/gen';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import { Pencil, Trash2 } from 'lucide-react';

const empty = { mon_desc: '', mon_simbolo: '', mon_tasa_comp: 0, mon_tasa_vta: 0 };

function matchesMoneda(m: Moneda, q: string) {
  const s = `${m.mon_codigo} ${m.mon_desc} ${m.mon_simbolo ?? ''}`.toLowerCase();
  return s.includes(q);
}

export default function MonedasPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'nueva' | Moneda>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: monedasRaw = [], isLoading } = useQuery({ queryKey: ['monedas'], queryFn: getMonedas });

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return monedasRaw;
    return monedasRaw.filter((m) => matchesMoneda(m, q));
  }, [monedasRaw, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const monedas = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, safePage, limit]);

  const inv = () => qc.invalidateQueries({ queryKey: ['monedas'] });

  const openNueva  = () => { setForm(empty); setError(''); setModal('nueva'); };
  const openEditar = (m: Moneda) => { setForm({ mon_desc: m.mon_desc, mon_simbolo: m.mon_simbolo ?? '', mon_tasa_comp: m.mon_tasa_comp ?? 0, mon_tasa_vta: m.mon_tasa_vta ?? 0 }); setError(''); setModal(m); };

  const createMut = useMutation({ mutationFn: createMoneda, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateMoneda(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteMoneda, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.mon_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nueva' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Moneda).mon_codigo, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Monedas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monedas y tasas de cambio</p>
        </div>
        <PrimaryAddButton label="Nueva moneda" shortLabel="Nueva" onClick={openNueva} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar moneda..." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 w-20">Código</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 w-16">Símbolo</th>
                <th className="px-4 py-3 text-right hidden md:table-cell">Tasa compra</th>
                <th className="px-4 py-3 text-right hidden md:table-cell">Tasa venta</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin registros</td></tr>
              ) : monedas.map((m) => (
                <tr key={m.mon_codigo} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.mon_codigo}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.mon_desc}</td>
                  <td className="px-4 py-3 text-gray-500">{m.mon_simbolo}</td>
                  <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{m.mon_tasa_comp?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{m.mon_tasa_vta?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditar(m)} className="text-gray-400 hover:text-primary-600 transition"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar esta moneda?')) deleteMut.mutate(m.mon_codigo); }} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && (
          <TablePagination
            total={filtered.length}
            page={safePage}
            limit={limit}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nueva' ? 'Nueva moneda' : `Editar: ${(modal as Moneda).mon_desc}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.mon_desc} onChange={(e) => setForm({ ...form, mon_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Símbolo</label>
            <input value={form.mon_simbolo} onChange={(e) => setForm({ ...form, mon_simbolo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: $, Gs, USD" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa compra</label>
              <input type="number" value={form.mon_tasa_comp} onChange={(e) => setForm({ ...form, mon_tasa_comp: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa venta</label>
              <input type="number" value={form.mon_tasa_vta} onChange={(e) => setForm({ ...form, mon_tasa_vta: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
