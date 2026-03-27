'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTurnos, createTurno, updateTurno, deleteTurno } from '@/services/per';
import type { Turno } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const ESTADOS: Record<string, string> = { A: 'Activo', I: 'Inactivo' };

const COLUMNS = [
  { key: 'cod',    header: 'Cód.',        sortKey: 'cod',    headerClassName: 'w-16',                     cell: (r: Turno) => r.tur_codigo,  cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc',                                                cell: (r: Turno) => r.tur_desc,    cellClassName: 'font-medium text-gray-800' },
  { key: 'estado', header: 'Estado',                         headerClassName: 'hidden sm:table-cell w-24', cell: (r: Turno) => r.tur_estado ? (ESTADOS[r.tur_estado] ?? r.tur_estado) : '—', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
];

export default function TurnosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Turno | null>(null);
  const [form, setForm] = useState({ tur_desc: '', tur_estado: 'A' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['turnos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getTurnos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['turnos'] });

  const createMut = useMutation({ mutationFn: createTurno, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Turno> }) => updateTurno(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteTurno, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ tur_desc: '', tur_estado: 'A' }); setError(''); setModal(true); };
  const openEdit = (r: Turno) => { setEditing(r); setForm({ tur_desc: r.tur_desc, tur_estado: r.tur_estado ?? 'A' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.tur_desc.trim()) { setError('La descripción es requerida'); return; }
    if (editing) updateMut.mutate({ id: editing.tur_codigo, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Turnos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Turnos de trabajo del personal</p>
        </div>
        <PrimaryAddButton label="Nuevo turno" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.tur_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.tur_codigo)}
          deleteConfirmMessage="¿Eliminar este turno?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar turno' : 'Nuevo turno'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.tur_desc} onChange={(e) => setForm((f) => ({ ...f, tur_desc: e.target.value }))} placeholder="Ej: Turno mañana" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.tur_estado} onChange={(e) => setForm((f) => ({ ...f, tur_estado: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
