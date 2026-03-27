'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSecciones, createSeccion, updateSeccion, deleteSeccion, getAreas } from '@/services/per';
import type { Seccion } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16',                     cell: (r: Seccion) => r.per_secc_cod,       cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc',                                               cell: (r: Seccion) => r.per_secc_desc,      cellClassName: 'font-medium text-gray-800' },
  { key: 'area', header: 'Área',                         headerClassName: 'hidden sm:table-cell w-40', cell: (r: Seccion) => r.per_secc_area_desc ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
];

export default function SeccionesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Seccion | null>(null);
  const [form, setForm] = useState({ per_secc_desc: '', per_secc_area: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['secciones', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getSecciones({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const { data: areasData } = useQuery({
    queryKey: ['areas', { all: true }],
    queryFn: () => getAreas({ all: true }),
  });
  const areas = areasData?.data ?? [];

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['secciones'] });

  const createMut = useMutation({ mutationFn: createSeccion, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Seccion> }) => updateSeccion(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteSeccion, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ per_secc_desc: '', per_secc_area: '' }); setError(''); setModal(true); };
  const openEdit = (r: Seccion) => { setEditing(r); setForm({ per_secc_desc: r.per_secc_desc, per_secc_area: r.per_secc_area?.toString() ?? '' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.per_secc_desc.trim()) { setError('La descripción es requerida'); return; }
    const payload = { per_secc_desc: form.per_secc_desc, per_secc_area: form.per_secc_area ? Number(form.per_secc_area) : undefined };
    if (editing) updateMut.mutate({ id: editing.per_secc_cod, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Secciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Secciones organizacionales del personal</p>
        </div>
        <PrimaryAddButton label="Nueva sección" shortLabel="Nueva" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.per_secc_cod}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.per_secc_cod)}
          deleteConfirmMessage="¿Eliminar esta sección?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar sección' : 'Nueva sección'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.per_secc_desc} onChange={(e) => setForm((f) => ({ ...f, per_secc_desc: e.target.value }))} placeholder="Ej: Contabilidad" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select value={form.per_secc_area} onChange={(e) => setForm((f) => ({ ...f, per_secc_area: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">— Sin área —</option>
                {areas.map((a) => <option key={a.per_area_cod} value={a.per_area_cod}>{a.per_area_desc}</option>)}
              </select>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
