'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTiposProveedor, createTipoProveedor, updateTipoProveedor, deleteTipoProveedor } from '@/services/fin';
import type { TipoProveedor } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const emptyForm = { tipr_desc: '' };

export default function TiposProveedorPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<TipoProveedor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['tipos-proveedor', { page, limit, search: debouncedSearch }],
    queryFn: () => getTiposProveedor({ page, limit, search: debouncedSearch }),
  });

  const tipos      = data?.data ?? [];
  const pagination = data?.pagination;
  const inv = () => qc.invalidateQueries({ queryKey: ['tipos-proveedor'] });

  const createMut = useMutation({ mutationFn: createTipoProveedor, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<TipoProveedor> }) => updateTipoProveedor(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteTipoProveedor, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true); };
  const openEdit = (t: TipoProveedor) => { setEditing(t); setForm({ tipr_desc: t.tipr_desc }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.tipr_desc.trim()) { setError('La descripción es requerida'); return; }
    if (editing) updateMut.mutate({ id: editing.tipr_codigo, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tipos de proveedor</h1>
          <p className="text-sm text-gray-500 mt-0.5">Clasificación de proveedores</p>
        </div>
        <PrimaryAddButton label="Nuevo tipo" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={tipos} getRowKey={(t) => t.tipr_codigo}
          onEdit={openEdit} onDelete={(t) => deleteMut.mutate(t.tipr_codigo)}
          deleteConfirmMessage="¿Eliminar este tipo de proveedor?"
          tableClassName="w-full text-sm"
          columns={[
            { key: 'cod',  header: 'Cód.', headerClassName: 'w-16', cell: (t) => t.tipr_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
            { key: 'desc', header: 'Descripción', cell: (t) => t.tipr_desc, cellClassName: 'font-medium text-gray-800' },
          ]}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar tipo de proveedor' : 'Nuevo tipo de proveedor'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.tipr_desc} onChange={(e) => setForm({ tipr_desc: e.target.value })} placeholder="Ej: Nacional, Importado" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
