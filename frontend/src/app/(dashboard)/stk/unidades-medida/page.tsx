'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUnidadesMedida, createUnidadMedida, deleteUnidadMedida } from '@/services/stk';
import type { UnidadMedida } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const empty = { um_codigo: '' };

const COLUMNS = [
  { key: 'codigo', header: 'Código', sortKey: 'codigo', cell: (u: UnidadMedida) => u.um_codigo, cellClassName: 'font-mono font-medium text-gray-800' },
];

export default function UnidadesMedidaPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['unidades-medida', { page, limit, search: debouncedSearch, sortDir }],
    queryFn: () => getUnidadesMedida({ page, limit, search: debouncedSearch, sortDir }),
  });

  const unidades = data?.data ?? [];
  const pagination = data?.pagination;

  const inv = () => qc.invalidateQueries({ queryKey: ['unidades-medida'] });
  const handleSortChange = (_field: string, dir: 'asc' | 'desc') => { setSortDir(dir); setPage(1); };

  const createMut = useMutation({
    mutationFn: createUnidadMedida,
    onSuccess: () => { inv(); setModal(false); setForm(empty); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error'),
  });

  const deleteMut = useMutation({ mutationFn: deleteUnidadMedida, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.um_codigo.trim()) { setError('El código es requerido'); return; }
    createMut.mutate({ um_codigo: form.um_codigo.trim().toUpperCase() });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Unidades de medida</h1>
          <p className="text-sm text-gray-500 mt-0.5">Códigos de unidades (KG, LT, MT, etc.)</p>
        </div>
        <PrimaryAddButton label="Nueva unidad" shortLabel="Nueva" onClick={() => { setForm(empty); setError(''); setModal(true); }} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar unidad..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={unidades}
          getRowKey={(u) => u.um_codigo}
          onDelete={(u: UnidadMedida) => deleteMut.mutate(u.um_codigo)}
          deleteConfirmMessage="¿Eliminar esta unidad de medida?"
          tableClassName="w-full text-sm"
          columns={COLUMNS}
          sortField="codigo"
          sortDir={sortDir}
          onSortChange={handleSortChange}
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

      {modal && (
        <FormModal
          title="Nueva unidad de medida"
          onClose={() => setModal(false)}
          onSubmit={handleSubmit}
          isPending={createMut.isPending}
          error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código <span className="text-red-500">*</span></label>
            <input
              value={form.um_codigo}
              onChange={(e) => setForm({ um_codigo: e.target.value })}
              placeholder="Ej: KG, LT, MT, UN"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </FormModal>
      )}
    </div>
  );
}
