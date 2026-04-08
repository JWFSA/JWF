'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDistritos, createDistrito, updateDistrito, deleteDistrito, getPaises } from '@/services/gen';
import type { Distrito } from '@/types/gen';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (r: Distrito) => r.dist_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc',                           cell: (r: Distrito) => r.dist_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'pais', header: 'País',        sortKey: 'pais', headerClassName: 'hidden sm:table-cell', cell: (r: Distrito) => r.pais_desc || '—', cellClassName: 'hidden sm:table-cell text-sm text-gray-500' },
];

export default function DistritosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Distrito | null>(null);
  const [form, setForm] = useState({ dist_desc: '', dist_pais: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['distritos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getDistritos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const { data: paisesData } = useQuery({ queryKey: ['paises'], queryFn: getPaises });
  const paises = Array.isArray(paisesData) ? paisesData : [];

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['distritos'] });

  const createMut = useMutation({ mutationFn: createDistrito, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Distrito> }) => updateDistrito(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteDistrito, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ dist_desc: '', dist_pais: '' }); setError(''); setModal(true); };
  const openEdit = (r: Distrito) => { setEditing(r); setForm({ dist_desc: r.dist_desc, dist_pais: r.dist_pais?.toString() ?? '' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.dist_desc.trim()) { setError('La descripción es requerida'); return; }
    const payload = { dist_desc: form.dist_desc.toUpperCase(), dist_pais: form.dist_pais ? Number(form.dist_pais) : null };
    if (editing) updateMut.mutate({ id: editing.dist_codigo, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Distritos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catálogo de distritos</p>
        </div>
        <PrimaryAddButton label="Nuevo distrito" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.dist_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.dist_codigo)}
          deleteConfirmMessage="¿Eliminar este distrito?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar distrito' : 'Nuevo distrito'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
              <select value={form.dist_pais} onChange={(e) => setForm((f) => ({ ...f, dist_pais: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">— Seleccione —</option>
                {paises.map((p: any) => <option key={p.pais_codigo} value={p.pais_codigo}>{p.pais_desc}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.dist_desc} onChange={(e) => setForm((f) => ({ ...f, dist_desc: e.target.value }))} placeholder="Ej: Central" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
