'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLineas, createLinea, updateLinea, deleteLinea } from '@/services/stk';
import type { Linea } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const empty = { lin_desc: '' };

const COLUMNS = [
  { key: 'codigo', header: 'Código', sortKey: 'cod', headerClassName: 'w-24', cell: (l: Linea) => l.lin_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc', cell: (l: Linea) => l.lin_desc, cellClassName: 'font-medium text-gray-800' },
];

export default function LineasPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState<null | 'nueva' | Linea>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['lineas', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getLineas({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const lineas = data?.data ?? [];
  const pagination = data?.pagination;

  const inv = () => qc.invalidateQueries({ queryKey: ['lineas'] });
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const openNueva  = () => { setForm(empty); setError(''); setModal('nueva'); };
  const openEditar = (l: Linea) => { setForm({ lin_desc: l.lin_desc }); setError(''); setModal(l); };

  const createMut = useMutation({ mutationFn: createLinea, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateLinea(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteLinea, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.lin_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nueva' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Linea).lin_codigo, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Líneas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Líneas de productos</p>
        </div>
        <PrimaryAddButton label="Nueva línea" shortLabel="Nueva" onClick={openNueva} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar línea..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={lineas}
          getRowKey={(l) => l.lin_codigo}
          onEdit={openEditar}
          onDelete={(l) => deleteMut.mutate(l.lin_codigo)}
          deleteConfirmMessage="¿Eliminar esta línea?"
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
          title={modal === 'nueva' ? 'Nueva línea' : `Editar: ${(modal as Linea).lin_desc}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.lin_desc} onChange={(e) => setForm({ lin_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
