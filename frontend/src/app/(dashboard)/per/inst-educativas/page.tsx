'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInstEducativas, createInstEducativa, updateInstEducativa, deleteInstEducativa } from '@/services/per';
import type { InstEducativa } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const FLAG = (v: string | null) => v === 'S' ? 'Sí' : 'No';

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (r: InstEducativa) => r.inst_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc',                           cell: (r: InstEducativa) => r.inst_descripcion, cellClassName: 'font-medium text-gray-800' },
  { key: 'pp',   header: 'Pre-P',       headerClassName: 'hidden sm:table-cell w-16 text-center', cell: (r: InstEducativa) => FLAG(r.inst_pp), cellClassName: 'hidden sm:table-cell text-center text-xs text-gray-500' },
  { key: 'p',    header: 'Prim.',       headerClassName: 'hidden sm:table-cell w-16 text-center', cell: (r: InstEducativa) => FLAG(r.inst_p), cellClassName: 'hidden sm:table-cell text-center text-xs text-gray-500' },
  { key: 's',    header: 'Sec.',        headerClassName: 'hidden md:table-cell w-16 text-center', cell: (r: InstEducativa) => FLAG(r.inst_s), cellClassName: 'hidden md:table-cell text-center text-xs text-gray-500' },
  { key: 't',    header: 'Terc.',       headerClassName: 'hidden md:table-cell w-16 text-center', cell: (r: InstEducativa) => FLAG(r.inst_t), cellClassName: 'hidden md:table-cell text-center text-xs text-gray-500' },
  { key: 'i',    header: 'Inst.',       headerClassName: 'hidden lg:table-cell w-16 text-center', cell: (r: InstEducativa) => FLAG(r.inst_i), cellClassName: 'hidden lg:table-cell text-center text-xs text-gray-500' },
];

export default function InstEducativasPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<InstEducativa | null>(null);
  const [form, setForm] = useState({ inst_descripcion: '', inst_pp: 'N', inst_p: 'N', inst_s: 'N', inst_t: 'N', inst_i: 'N' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['inst-educativas', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getInstEducativas({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['inst-educativas'] });

  const createMut = useMutation({ mutationFn: createInstEducativa, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<InstEducativa> }) => updateInstEducativa(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteInstEducativa, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ inst_descripcion: '', inst_pp: 'N', inst_p: 'N', inst_s: 'N', inst_t: 'N', inst_i: 'N' }); setError(''); setModal(true); };
  const openEdit = (r: InstEducativa) => { setEditing(r); setForm({ inst_descripcion: r.inst_descripcion, inst_pp: r.inst_pp ?? 'N', inst_p: r.inst_p ?? 'N', inst_s: r.inst_s ?? 'N', inst_t: r.inst_t ?? 'N', inst_i: r.inst_i ?? 'N' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.inst_descripcion.trim()) { setError('La descripción es requerida'); return; }
    if (editing) updateMut.mutate({ id: editing.inst_codigo, data: form });
    else createMut.mutate(form);
  };

  const toggle = (key: string) => setForm((f: any) => ({ ...f, [key]: f[key] === 'S' ? 'N' : 'S' }));

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Instituciones educativas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Instituciones y niveles que ofrecen</p>
        </div>
        <PrimaryAddButton label="Nueva institución" shortLabel="Nueva" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.inst_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.inst_codigo)}
          deleteConfirmMessage="¿Eliminar esta institución educativa?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar institución' : 'Nueva institución educativa'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.inst_descripcion} onChange={(e) => setForm((f) => ({ ...f, inst_descripcion: e.target.value }))} placeholder="Ej: Universidad Nacional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Niveles que ofrece</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'inst_pp', label: 'Pre-primaria' },
                  { key: 'inst_p',  label: 'Primaria' },
                  { key: 'inst_s',  label: 'Secundaria' },
                  { key: 'inst_t',  label: 'Terciaria' },
                  { key: 'inst_i',  label: 'Instituto' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(form as any)[key] === 'S'} onChange={() => toggle(key)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
