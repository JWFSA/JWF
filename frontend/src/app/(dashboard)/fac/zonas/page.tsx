'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getZonas, createZona, updateZona, deleteZona } from '@/services/fac';
import type { Zona } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

type ModalState = null | 'nueva' | Zona;
const empty = { zona_desc: '' };

const COLUMNS = [
  { key: 'codigo', header: 'Código',      sortKey: 'cod',  headerClassName: 'w-24', cell: (z: Zona) => z.zona_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc',                          cell: (z: Zona) => z.zona_desc,   cellClassName: 'font-medium text-gray-800' },
];

export default function ZonasPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['zonas', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getZonas({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const zonas = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['zonas'] });

  const openNueva  = () => { setForm(empty); setError(''); setModal('nueva'); };
  const openEditar = (z: Zona) => { setForm({ zona_desc: z.zona_desc }); setError(''); setModal(z); };

  const createMut = useMutation({ mutationFn: createZona, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateZona(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteZona, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.zona_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nueva' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Zona).zona_codigo, data: form });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Zonas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Zonas de venta y distribución</p>
        </div>
        <PrimaryAddButton label="Nueva zona" shortLabel="Nueva" onClick={openNueva} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar zona..." />
        </div>
        <DataTable isLoading={isLoading} rows={zonas} getRowKey={(z) => z.zona_codigo}
          onEdit={openEditar} onDelete={(z) => deleteMut.mutate(z.zona_codigo)}
          deleteConfirmMessage="¿Eliminar esta zona?"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal !== null && (
        <FormModal title={modal === 'nueva' ? 'Nueva zona' : `Editar: ${(modal as Zona).zona_desc}`}
          onClose={() => setModal(null)} onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.zona_desc} onChange={(e) => setForm({ zona_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
