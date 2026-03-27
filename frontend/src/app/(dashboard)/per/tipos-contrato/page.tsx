'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTiposContrato, createTipoContrato, updateTipoContrato, deleteTipoContrato } from '@/services/per';
import type { TipoContrato } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (r: TipoContrato) => r.tipcon_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc',                           cell: (r: TipoContrato) => r.tipcon_descripcion, cellClassName: 'font-medium text-gray-800' },
  { key: 'prueba', header: 'Período prueba', headerClassName: 'hidden sm:table-cell w-36 text-center',
    cell: (r: TipoContrato) => r.tipcon_ind_prueba ? 'Sí' : 'No',
    cellClassName: 'hidden sm:table-cell text-center text-xs text-gray-500' },
];

export default function TiposContratoPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<TipoContrato | null>(null);
  const [form, setForm] = useState({ tipcon_descripcion: '', tipcon_ind_prueba: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['tipos-contrato', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getTiposContrato({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['tipos-contrato'] });

  const createMut = useMutation({ mutationFn: createTipoContrato, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<TipoContrato> }) => updateTipoContrato(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteTipoContrato, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ tipcon_descripcion: '', tipcon_ind_prueba: 0 }); setError(''); setModal(true); };
  const openEdit = (r: TipoContrato) => { setEditing(r); setForm({ tipcon_descripcion: r.tipcon_descripcion, tipcon_ind_prueba: r.tipcon_ind_prueba }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.tipcon_descripcion.trim()) { setError('La descripción es requerida'); return; }
    if (editing) updateMut.mutate({ id: editing.tipcon_codigo, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tipos de contrato</h1>
          <p className="text-sm text-gray-500 mt-0.5">Modalidades de contratación del personal</p>
        </div>
        <PrimaryAddButton label="Nuevo tipo" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.tipcon_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.tipcon_codigo)}
          deleteConfirmMessage="¿Eliminar este tipo de contrato?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar tipo de contrato' : 'Nuevo tipo de contrato'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.tipcon_descripcion} onChange={(e) => setForm((f) => ({ ...f, tipcon_descripcion: e.target.value }))} placeholder="Ej: Indefinido" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ind_prueba" checked={form.tipcon_ind_prueba === 1}
                onChange={(e) => setForm((f) => ({ ...f, tipcon_ind_prueba: e.target.checked ? 1 : 0 }))}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="ind_prueba" className="text-sm font-medium text-gray-700">Incluye período de prueba</label>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
