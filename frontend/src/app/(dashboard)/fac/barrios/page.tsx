'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBarrios, createBarrio, updateBarrio, deleteBarrio } from '@/services/fac';
import type { Barrio } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const emptyForm = { ba_desc: '', ba_localidad: '' };

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (r: Barrio) => r.ba_codigo,    cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc',                          cell: (r: Barrio) => r.ba_desc,      cellClassName: 'font-medium text-gray-800' },
  { key: 'loc',  header: 'Localidad',                    headerClassName: 'hidden md:table-cell', cell: (r: Barrio) => r.ba_localidad ?? '—', cellClassName: 'hidden md:table-cell text-gray-500' },
];

export default function BarriosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Barrio | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['barrios', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getBarrios({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const barrios    = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['barrios'] });

  const createMut = useMutation({ mutationFn: createBarrio, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Barrio> }) => updateBarrio(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteBarrio, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true); };
  const openEdit = (r: Barrio) => { setEditing(r); setForm({ ba_desc: r.ba_desc, ba_localidad: r.ba_localidad?.toString() ?? '' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.ba_desc.trim()) { setError('La descripción es requerida'); return; }
    const payload = { ba_desc: form.ba_desc, ba_localidad: form.ba_localidad ? Number(form.ba_localidad) : null };
    if (editing) updateMut.mutate({ id: editing.ba_codigo, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Barrios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Barrios para la dirección de clientes</p>
        </div>
        <PrimaryAddButton label="Nuevo barrio" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={barrios} getRowKey={(r) => r.ba_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.ba_codigo)}
          deleteConfirmMessage="¿Eliminar este barrio?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar barrio' : 'Nuevo barrio'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.ba_desc} onChange={(e) => setForm((f) => ({ ...f, ba_desc: e.target.value }))} placeholder="Ej: Centro, Villa Morra" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
              <input type="number" value={form.ba_localidad} onChange={(e) => setForm((f) => ({ ...f, ba_localidad: e.target.value }))} placeholder="Código de localidad" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
