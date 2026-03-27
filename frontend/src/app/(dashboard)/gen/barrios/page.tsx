'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBarrios, createBarrio, updateBarrio, deleteBarrio, getDepartamentos, getLocalidades } from '@/services/gen';
import type { Barrio } from '@/types/gen';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',         sortKey: 'cod',  headerClassName: 'w-16', cell: (r: Barrio) => r.barr_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción',  sortKey: 'desc',                           cell: (r: Barrio) => r.barr_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'loc',  header: 'Localidad',    sortKey: 'loc',  headerClassName: 'hidden sm:table-cell', cell: (r: Barrio) => r.loc_desc || '—', cellClassName: 'hidden sm:table-cell text-sm text-gray-500' },
  { key: 'dep',  header: 'Departamento', headerClassName: 'hidden md:table-cell',   cell: (r: Barrio) => r.dpto_desc || '—', cellClassName: 'hidden md:table-cell text-sm text-gray-500' },
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
  const [form, setForm] = useState({ barr_desc: '', barr_codigo_loc: '', barr_codigo_dep: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['barrios-gen', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getBarrios({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const { data: deptos } = useQuery({ queryKey: ['departamentos'], queryFn: getDepartamentos });
  const { data: locData } = useQuery({ queryKey: ['localidades', { all: true }], queryFn: () => getLocalidades({ all: true }) });
  const localidades = locData?.data ?? [];

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['barrios-gen'] });

  const createMut = useMutation({ mutationFn: createBarrio, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Barrio> }) => updateBarrio(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteBarrio, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ barr_desc: '', barr_codigo_loc: '', barr_codigo_dep: '' }); setError(''); setModal(true); };
  const openEdit = (r: Barrio) => { setEditing(r); setForm({ barr_desc: r.barr_desc, barr_codigo_loc: r.barr_codigo_loc?.toString() ?? '', barr_codigo_dep: r.barr_codigo_dep?.toString() ?? '' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.barr_desc.trim()) { setError('La descripción es requerida'); return; }
    const payload = { barr_desc: form.barr_desc, barr_codigo_loc: form.barr_codigo_loc ? Number(form.barr_codigo_loc) : null, barr_codigo_dep: form.barr_codigo_dep ? Number(form.barr_codigo_dep) : null };
    if (editing) updateMut.mutate({ id: editing.barr_codigo, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Barrios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Barrios con localidad y departamento</p>
        </div>
        <PrimaryAddButton label="Nuevo barrio" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.barr_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.barr_codigo)}
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
              <input value={form.barr_desc} onChange={(e) => setForm((f) => ({ ...f, barr_desc: e.target.value }))} placeholder="Ej: Villa Morra" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
                <select value={form.barr_codigo_loc} onChange={(e) => setForm((f) => ({ ...f, barr_codigo_loc: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Sin localidad —</option>
                  {localidades.map((l: any) => <option key={l.loc_codigo} value={l.loc_codigo}>{l.loc_desc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <select value={form.barr_codigo_dep} onChange={(e) => setForm((f) => ({ ...f, barr_codigo_dep: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Sin departamento —</option>
                  {(deptos ?? []).map((d: any) => <option key={d.dpto_codigo} value={d.dpto_codigo}>{d.dpto_desc}</option>)}
                </select>
              </div>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
