'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMotivosAnulacion, createMotivoAnulacion, updateMotivoAnulacion, deleteMotivoAnulacion } from '@/services/gen';
import type { MotivoAnulacion } from '@/types/gen';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (r: MotivoAnulacion) => r.moan_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc',                           cell: (r: MotivoAnulacion) => r.moan_desc, cellClassName: 'font-medium text-gray-800' },
];

export default function MotivosAnulacionPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<MotivoAnulacion | null>(null);
  const [form, setForm] = useState({ moan_desc: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['motivos-anulacion', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getMotivosAnulacion({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['motivos-anulacion'] });

  const createMut = useMutation({ mutationFn: createMotivoAnulacion, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<MotivoAnulacion> }) => updateMotivoAnulacion(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteMotivoAnulacion, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ moan_desc: '' }); setError(''); setModal(true); };
  const openEdit = (r: MotivoAnulacion) => { setEditing(r); setForm({ moan_desc: r.moan_desc }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.moan_desc.trim()) { setError('La descripción es requerida'); return; }
    if (editing) updateMut.mutate({ id: editing.moan_codigo, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Motivos de anulación</h1>
          <p className="text-sm text-gray-500 mt-0.5">Razones para anulación de documentos</p>
        </div>
        <PrimaryAddButton label="Nuevo motivo" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.moan_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.moan_codigo)}
          deleteConfirmMessage="¿Eliminar este motivo de anulación?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar motivo' : 'Nuevo motivo de anulación'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.moan_desc} onChange={(e) => setForm({ moan_desc: e.target.value })} placeholder="Ej: Error de facturación" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
