'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRamos, createRamo, updateRamo, deleteRamo } from '@/services/fin';
import type { Ramo } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const emptyForm = { ramo_desc: '' };

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (r: Ramo) => r.ramo_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc',                          cell: (r: Ramo) => r.ramo_desc,   cellClassName: 'font-medium text-gray-800' },
];

export default function RamosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Ramo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['ramos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getRamos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const ramos      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['ramos'] });

  const createMut = useMutation({ mutationFn: createRamo, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Ramo> }) => updateRamo(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteRamo, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true); };
  const openEdit = (r: Ramo) => { setEditing(r); setForm({ ramo_desc: r.ramo_desc }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.ramo_desc.trim()) { setError('La descripción es requerida'); return; }
    if (editing) updateMut.mutate({ id: editing.ramo_codigo, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Ramos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Clasificación de actividad de clientes</p>
        </div>
        <PrimaryAddButton label="Nuevo ramo" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={ramos} getRowKey={(r) => r.ramo_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.ramo_codigo)}
          deleteConfirmMessage="¿Eliminar este ramo?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar ramo' : 'Nuevo ramo'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.ramo_desc} onChange={(e) => setForm({ ramo_desc: e.target.value })} placeholder="Ej: Comercio, Industria" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
