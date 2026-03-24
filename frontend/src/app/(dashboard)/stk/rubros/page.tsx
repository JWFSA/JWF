'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import { getRubros, createRubro, updateRubro, deleteRubro } from '@/services/stk';
import type { Rubro } from '@/types/stk';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';

const empty = { rub_desc: '', rub_ind_incluir_ranking: 'N' as 'S' | 'N' };

export default function RubrosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modal, setModal] = useState<null | 'nuevo' | Rubro>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['rubros', { page, limit, search: debouncedSearch }],
    queryFn: () => getRubros({ page, limit, search: debouncedSearch }),
  });

  const rubros = data?.data ?? [];
  const pagination = data?.pagination;

  const inv = () => qc.invalidateQueries({ queryKey: ['rubros'] });

  const openNuevo  = () => { setForm(empty); setError(''); setModal('nuevo'); };
  const openEditar = (r: Rubro) => { setForm({ rub_desc: r.rub_desc, rub_ind_incluir_ranking: (r.rub_ind_incluir_ranking as 'S' | 'N') ?? 'N' }); setError(''); setModal(r); };

  const createMut = useMutation({ mutationFn: createRubro, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateRubro(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteRubro, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.rub_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nuevo' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Rubro).rub_codigo, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Rubros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Rubros de artículos</p>
        </div>
        <PrimaryAddButton label="Nuevo rubro" shortLabel="Nuevo" onClick={openNuevo} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar rubro..." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[300px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 w-24">Código</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 hidden md:table-cell text-center">Ranking</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : rubros.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Sin resultados</td></tr>
              ) : rubros.map((r) => (
                <tr key={r.rub_codigo} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.rub_codigo}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.rub_desc}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-center">
                    {r.rub_ind_incluir_ranking === 'S' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Sí</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditar(r)} className="text-gray-400 hover:text-primary-600 transition"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar este rubro?')) deleteMut.mutate(r.rub_codigo); }} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <TablePagination
            total={pagination.total}
            page={page}
            limit={limit}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nuevo' ? 'Nuevo rubro' : `Editar: ${(modal as Rubro).rub_desc}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.rub_desc} onChange={(e) => setForm({ ...form, rub_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ranking" checked={form.rub_ind_incluir_ranking === 'S'}
              onChange={(e) => setForm({ ...form, rub_ind_incluir_ranking: e.target.checked ? 'S' : 'N' })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="ranking" className="text-sm text-gray-700">Incluir en ranking</label>
          </div>
        </FormModal>
      )}
    </div>
  );
}
