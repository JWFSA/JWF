'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTiposFamiliar, createTipoFamiliar, updateTipoFamiliar, deleteTipoFamiliar } from '@/services/per';
import type { TipoFamiliar } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (r: TipoFamiliar) => r.tipo_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc',                           cell: (r: TipoFamiliar) => r.tipo_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'cobra', header: 'Cobra concepto', headerClassName: 'hidden sm:table-cell w-32 text-center',
    cell: (r: TipoFamiliar) => r.tipo_cobra_conc || '—',
    cellClassName: 'hidden sm:table-cell text-center text-xs text-gray-500' },
];

export default function TiposFamiliarPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<TipoFamiliar | null>(null);
  const [form, setForm] = useState({ tipo_desc: '', tipo_cobra_conc: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['tipos-familiar', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getTiposFamiliar({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['tipos-familiar'] });

  const createMut = useMutation({ mutationFn: createTipoFamiliar, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<TipoFamiliar> }) => updateTipoFamiliar(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteTipoFamiliar, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ tipo_desc: '', tipo_cobra_conc: '' }); setError(''); setModal(true); };
  const openEdit = (r: TipoFamiliar) => { setEditing(r); setForm({ tipo_desc: r.tipo_desc, tipo_cobra_conc: r.tipo_cobra_conc ?? '' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.tipo_desc.trim()) { setError('La descripción es requerida'); return; }
    if (editing) updateMut.mutate({ id: editing.tipo_codigo, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tipos de familiar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Parentescos para registro de familiares</p>
        </div>
        <PrimaryAddButton label="Nuevo tipo" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.tipo_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.tipo_codigo)}
          deleteConfirmMessage="¿Eliminar este tipo de familiar?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar tipo de familiar' : 'Nuevo tipo de familiar'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.tipo_desc} onChange={(e) => setForm((f) => ({ ...f, tipo_desc: e.target.value }))} placeholder="Ej: Cónyuge" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cobra concepto</label>
              <input value={form.tipo_cobra_conc} onChange={(e) => setForm((f) => ({ ...f, tipo_cobra_conc: e.target.value }))} placeholder="Ej: SI" maxLength={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
