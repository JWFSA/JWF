'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocalidades, createLocalidad, updateLocalidad, deleteLocalidad, getDistritos } from '@/services/gen';
import type { Localidad } from '@/types/gen';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',         sortKey: 'cod',  headerClassName: 'w-16', cell: (r: Localidad) => r.loc_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción',  sortKey: 'desc',                           cell: (r: Localidad) => r.loc_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'dist', header: 'Distrito',     sortKey: 'dist', headerClassName: 'hidden sm:table-cell', cell: (r: Localidad) => r.dist_desc || '—', cellClassName: 'hidden sm:table-cell text-sm text-gray-500' },
];

export default function LocalidadesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Localidad | null>(null);
  const [form, setForm] = useState({ loc_desc: '', loc_distrito: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['localidades', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getLocalidades({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const { data: distData } = useQuery({ queryKey: ['distritos', { all: true }], queryFn: () => getDistritos({ all: true }) });
  const distritos = distData?.data ?? [];

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['localidades'] });

  const createMut = useMutation({ mutationFn: createLocalidad, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Localidad> }) => updateLocalidad(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteLocalidad, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ loc_desc: '', loc_distrito: '' }); setError(''); setModal(true); };
  const openEdit = (r: Localidad) => { setEditing(r); setForm({ loc_desc: r.loc_desc, loc_distrito: r.loc_distrito?.toString() ?? '' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.loc_desc.trim()) { setError('La descripción es requerida'); return; }
    const payload = { loc_desc: form.loc_desc.toUpperCase(), loc_distrito: form.loc_distrito ? Number(form.loc_distrito) : null };
    if (editing) updateMut.mutate({ id: editing.loc_codigo, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Localidades</h1>
          <p className="text-sm text-gray-500 mt-0.5">Localidades con departamento y distrito</p>
        </div>
        <PrimaryAddButton label="Nueva localidad" shortLabel="Nueva" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.loc_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.loc_codigo)}
          deleteConfirmMessage="¿Eliminar esta localidad?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar localidad' : 'Nueva localidad'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.loc_desc} onChange={(e) => setForm((f) => ({ ...f, loc_desc: e.target.value }))} placeholder="Ej: Fernando de la Mora" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
              <select value={form.loc_distrito} onChange={(e) => setForm((f) => ({ ...f, loc_distrito: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">— Seleccione —</option>
                {distritos.map((d: any) => <option key={d.dist_codigo} value={d.dist_codigo}>{d.dist_desc}</option>)}
              </select>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
