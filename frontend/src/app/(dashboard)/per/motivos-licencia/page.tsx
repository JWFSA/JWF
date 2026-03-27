'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMotivosLicencia, createMotivoLicencia, updateMotivoLicencia, deleteMotivoLicencia } from '@/services/per';
import type { MotivoLicencia } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const TIPOS: Record<string, string> = { L: 'Licencia', P: 'Permiso' };

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (r: MotivoLicencia) => r.mlic_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc',                           cell: (r: MotivoLicencia) => r.mlic_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'tipo', header: 'Tipo',        sortKey: 'tipo', headerClassName: 'hidden sm:table-cell w-24', cell: (r: MotivoLicencia) => TIPOS[r.mlic_tipo ?? ''] || r.mlic_tipo || '—', cellClassName: 'hidden sm:table-cell text-sm text-gray-500' },
  { key: 'dias', header: 'Días',        headerClassName: 'hidden sm:table-cell w-16 text-center', cell: (r: MotivoLicencia) => r.mlic_cat_dias ?? '—', cellClassName: 'hidden sm:table-cell text-center text-sm text-gray-500' },
  { key: 'ips',  header: 'IPS',         headerClassName: 'hidden md:table-cell w-16 text-center', cell: (r: MotivoLicencia) => r.mlic_ips === 'S' ? 'Sí' : 'No', cellClassName: 'hidden md:table-cell text-center text-sm text-gray-500' },
];

export default function MotivosLicenciaPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<MotivoLicencia | null>(null);
  const [form, setForm] = useState({ mlic_desc: '', mlic_tipo: '', mlic_cat_dias: '', mlic_ips: 'N', mlic_control_deficit: 'N' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['motivos-licencia', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getMotivosLicencia({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['motivos-licencia'] });

  const createMut = useMutation({ mutationFn: createMotivoLicencia, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<MotivoLicencia> }) => updateMotivoLicencia(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteMotivoLicencia, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ mlic_desc: '', mlic_tipo: '', mlic_cat_dias: '', mlic_ips: 'N', mlic_control_deficit: 'N' }); setError(''); setModal(true); };
  const openEdit = (r: MotivoLicencia) => { setEditing(r); setForm({ mlic_desc: r.mlic_desc, mlic_tipo: r.mlic_tipo ?? '', mlic_cat_dias: r.mlic_cat_dias?.toString() ?? '', mlic_ips: r.mlic_ips ?? 'N', mlic_control_deficit: r.mlic_control_deficit ?? 'N' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.mlic_desc.trim()) { setError('La descripción es requerida'); return; }
    const payload = { mlic_desc: form.mlic_desc, mlic_tipo: form.mlic_tipo || null, mlic_cat_dias: form.mlic_cat_dias ? Number(form.mlic_cat_dias) : null, mlic_ips: form.mlic_ips, mlic_control_deficit: form.mlic_control_deficit };
    if (editing) updateMut.mutate({ id: editing.mlic_codigo, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Motivos de licencia</h1>
          <p className="text-sm text-gray-500 mt-0.5">Licencias y permisos del personal</p>
        </div>
        <PrimaryAddButton label="Nuevo motivo" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.mlic_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.mlic_codigo)}
          deleteConfirmMessage="¿Eliminar este motivo de licencia?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar motivo de licencia' : 'Nuevo motivo de licencia'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.mlic_desc} onChange={(e) => setForm((f) => ({ ...f, mlic_desc: e.target.value }))} placeholder="Ej: Duelo" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={form.mlic_tipo} onChange={(e) => setForm((f) => ({ ...f, mlic_tipo: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Seleccionar —</option>
                  <option value="L">Licencia</option>
                  <option value="P">Permiso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días</label>
                <input type="number" value={form.mlic_cat_dias} onChange={(e) => setForm((f) => ({ ...f, mlic_cat_dias: e.target.value }))} placeholder="Ej: 3" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.mlic_ips === 'S'} onChange={(e) => setForm((f) => ({ ...f, mlic_ips: e.target.checked ? 'S' : 'N' }))} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">Cubierto por IPS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.mlic_control_deficit === 'S'} onChange={(e) => setForm((f) => ({ ...f, mlic_control_deficit: e.target.checked ? 'S' : 'N' }))} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">Control de déficit</span>
              </label>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
