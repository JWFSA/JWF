'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TablePagination from '@/components/ui/TablePagination';
import DataTable from '@/components/ui/DataTable';
import { getRubros, createRubro, updateRubro, deleteRubro } from '@/services/stk';
import type { Rubro } from '@/types/stk';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';

const empty = { rub_desc: '', rub_ind_incluir_ranking: 'N' as 'S' | 'N' };

const COLUMNS = [
  { key: 'codigo', header: 'Código', sortKey: 'cod', headerClassName: 'w-24', cell: (r: Rubro) => r.rub_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc', cell: (r: Rubro) => r.rub_desc, cellClassName: 'font-medium text-gray-800' },
  {
    key: 'ranking',
    header: 'Ranking',
    headerClassName: 'hidden md:table-cell text-center',
    cell: (r: Rubro) => r.rub_ind_incluir_ranking === 'S'
      ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Sí</span>
      : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">No</span>,
    cellClassName: 'hidden md:table-cell text-center',
  },
];

export default function RubrosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState<null | 'nuevo' | Rubro>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['rubros', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getRubros({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const rubros = data?.data ?? [];
  const pagination = data?.pagination;

  const inv = () => qc.invalidateQueries({ queryKey: ['rubros'] });
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

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

        <DataTable
          isLoading={isLoading}
          rows={rubros}
          getRowKey={(r) => r.rub_codigo}
          onEdit={openEditar}
          onDelete={(r) => deleteMut.mutate(r.rub_codigo)}
          deleteConfirmMessage="¿Eliminar este rubro?"
          columns={COLUMNS}
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
        />

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
