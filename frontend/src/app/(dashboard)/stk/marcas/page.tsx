'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Pencil, Trash2, Save } from 'lucide-react';
import { getMarcas, createMarca, updateMarca, deleteMarca } from '@/services/stk';
import type { Marca } from '@/types/stk';
import Modal from '@/components/ui/Modal';

const empty = { marc_desc: '' };

export default function MarcasPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modal, setModal] = useState<null | 'nueva' | Marca>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['marcas', { page, limit, search: debouncedSearch }],
    queryFn: () => getMarcas({ page, limit, search: debouncedSearch }),
  });

  const marcas = data?.data ?? [];
  const pagination = data?.pagination;

  const inv = () => qc.invalidateQueries({ queryKey: ['marcas'] });

  const openNueva  = () => { setForm(empty); setError(''); setModal('nueva'); };
  const openEditar = (m: Marca) => { setForm({ marc_desc: m.marc_desc }); setError(''); setModal(m); };

  const createMut = useMutation({ mutationFn: createMarca, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateMarca(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteMarca, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.marc_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nueva' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Marca).marc_codigo, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Marcas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Marcas de productos</p>
        </div>
        <button onClick={openNueva} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={16} /><span className="hidden sm:inline">Nueva marca</span><span className="sm:hidden">Nueva</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar marca..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[300px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 w-24">Código</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : marcas.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Sin resultados</td></tr>
              ) : marcas.map((m) => (
                <tr key={m.marc_codigo} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.marc_codigo}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.marc_desc}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditar(m)} className="text-gray-400 hover:text-primary-600 transition"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar esta marca?')) deleteMut.mutate(m.marc_codigo); }} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>{pagination.total} registros</span>
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Primera página"><ChevronsLeft size={16} /></button>
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Página anterior"><ChevronLeft size={16} /></button>
                <span className="px-2">Página {page} de {pagination.totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page === pagination.totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Página siguiente"><ChevronRight size={16} /></button>
                <button onClick={() => setPage(pagination.totalPages)} disabled={page === pagination.totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Última página"><ChevronsRight size={16} /></button>
              </div>
            )}
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal === 'nueva' ? 'Nueva marca' : `Editar: ${(modal as Marca).marc_desc}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.marc_desc} onChange={(e) => setForm({ marc_desc: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSubmit} disabled={isPending} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
              <Save size={14} />{isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
