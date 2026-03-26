'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFormasPago, createFormaPago, updateFormaPago, deleteFormaPago } from '@/services/fin';
import type { FormaPago } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const emptyForm = { fpag_desc: '', fpag_dia_pago: '' };

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (f: FormaPago) => f.fpag_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc', cell: (f: FormaPago) => f.fpag_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'dias', header: 'Días pago',   headerClassName: 'hidden sm:table-cell w-24 text-right', cell: (f: FormaPago) => f.fpag_dia_pago ?? '—', cellClassName: 'hidden sm:table-cell text-right text-gray-500' },
];

export default function FormasPagoPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<FormaPago | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['formas-pago', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getFormasPago({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const formas     = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['formas-pago'] });

  const createMut = useMutation({ mutationFn: createFormaPago, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<FormaPago> }) => updateFormaPago(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteFormaPago, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true); };
  const openEdit = (f: FormaPago) => { setEditing(f); setForm({ fpag_desc: f.fpag_desc, fpag_dia_pago: String(f.fpag_dia_pago ?? '') }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.fpag_desc.trim()) { setError('La descripción es requerida'); return; }
    const payload: Partial<FormaPago> = { fpag_desc: form.fpag_desc, fpag_dia_pago: form.fpag_dia_pago ? Number(form.fpag_dia_pago) : null };
    if (editing) updateMut.mutate({ id: editing.fpag_codigo, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Formas de pago</h1>
          <p className="text-sm text-gray-500 mt-0.5">Modalidades de pago disponibles</p>
        </div>
        <PrimaryAddButton label="Nueva forma" shortLabel="Nueva" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={formas} getRowKey={(f) => f.fpag_codigo}
          onEdit={openEdit} onDelete={(f) => deleteMut.mutate(f.fpag_codigo)}
          deleteConfirmMessage="¿Eliminar esta forma de pago?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar forma de pago' : 'Nueva forma de pago'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.fpag_desc} onChange={(e) => setForm({ ...form, fpag_desc: e.target.value })} placeholder="Ej: Contado, 30 días" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Días de pago</label>
              <input type="number" min="0" value={form.fpag_dia_pago} onChange={(e) => setForm({ ...form, fpag_dia_pago: e.target.value })} placeholder="Ej: 30" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
