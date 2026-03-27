'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFormasPago, createFormaPago, updateFormaPago, deleteFormaPago } from '@/services/per';
import type { FormaPago } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const TIPOS: Record<string, string> = { EF: 'Efectivo', TJ: 'Tarjeta', CH: 'Cheque' };

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',       sortKey: 'cod',  headerClassName: 'w-16', cell: (r: FormaPago) => r.forma_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción',sortKey: 'desc',                           cell: (r: FormaPago) => r.forma_desc,   cellClassName: 'font-medium text-gray-800' },
  { key: 'tipo', header: 'Tipo',       headerClassName: 'hidden sm:table-cell w-28',
    cell: (r: FormaPago) => r.forma_tipo_pago ? (TIPOS[r.forma_tipo_pago] ?? r.forma_tipo_pago) : '—',
    cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
];

export default function FormasPagoPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<FormaPago | null>(null);
  const [form, setForm] = useState({ forma_desc: '', forma_tipo_pago: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['formas-pago-per', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getFormasPago({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['formas-pago-per'] });

  const createMut = useMutation({ mutationFn: createFormaPago, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<FormaPago> }) => updateFormaPago(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteFormaPago, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ forma_desc: '', forma_tipo_pago: '' }); setError(''); setModal(true); };
  const openEdit = (r: FormaPago) => { setEditing(r); setForm({ forma_desc: r.forma_desc, forma_tipo_pago: r.forma_tipo_pago ?? '' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.forma_desc.trim()) { setError('La descripción es requerida'); return; }
    if (editing) updateMut.mutate({ id: editing.forma_codigo, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Formas de pago</h1>
          <p className="text-sm text-gray-500 mt-0.5">Modalidades de pago de salarios</p>
        </div>
        <PrimaryAddButton label="Nueva forma" shortLabel="Nueva" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.forma_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.forma_codigo)}
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
              <input value={form.forma_desc} onChange={(e) => setForm((f) => ({ ...f, forma_desc: e.target.value }))} placeholder="Ej: Efectivo" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de pago</label>
              <select value={form.forma_tipo_pago} onChange={(e) => setForm((f) => ({ ...f, forma_tipo_pago: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">— Sin especificar —</option>
                <option value="EF">Efectivo</option>
                <option value="TJ">Tarjeta</option>
                <option value="CH">Cheque</option>
              </select>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
