'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TablePagination from '@/components/ui/TablePagination';
import DataTable from '@/components/ui/DataTable';
import { getMarcas, createMarca, updateMarca, deleteMarca } from '@/services/stk';
import type { Marca } from '@/types/stk';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';

const empty = { marc_desc: '' };

const COLUMNS = [
  { key: 'codigo', header: 'Código', sortKey: 'cod', headerClassName: 'w-24', cell: (m: Marca) => m.marc_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc', cell: (m: Marca) => m.marc_desc, cellClassName: 'font-medium text-gray-800' },
];

export default function MarcasPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState<null | 'nueva' | Marca>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['marcas', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getMarcas({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const marcas = data?.data ?? [];
  const pagination = data?.pagination;

  const inv = () => qc.invalidateQueries({ queryKey: ['marcas'] });
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

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
        <PrimaryAddButton label="Nueva marca" shortLabel="Nueva" onClick={openNueva} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar marca..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={marcas}
          getRowKey={(m) => m.marc_codigo}
          onEdit={openEditar}
          onDelete={(m) => deleteMut.mutate(m.marc_codigo)}
          deleteConfirmMessage="¿Eliminar esta marca?"
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
          title={modal === 'nueva' ? 'Nueva marca' : `Editar: ${(modal as Marca).marc_desc}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.marc_desc} onChange={(e) => setForm({ marc_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
