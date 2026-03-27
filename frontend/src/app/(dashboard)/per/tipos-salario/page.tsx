'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTiposSalario, createTipoSalario, updateTipoSalario, deleteTipoSalario } from '@/services/per';
import type { TipoSalario } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const TIPOS: Record<string, string> = { M: 'Mensual', H: 'Hora', D: 'Día', DJ: 'Destajo' };

const COLUMNS = [
  { key: 'cod',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (r: TipoSalario) => r.ptipo_sal_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc', header: 'Descripción', sortKey: 'desc',                           cell: (r: TipoSalario) => r.ptipo_sal_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'dias', header: 'Días trab.',  headerClassName: 'hidden sm:table-cell w-24 text-center', cell: (r: TipoSalario) => r.ptipo_sal_dias_trab ?? '—', cellClassName: 'hidden sm:table-cell text-center text-sm text-gray-500' },
  { key: 'tipo', header: 'Tipo',        sortKey: 'tipo', headerClassName: 'hidden sm:table-cell w-24', cell: (r: TipoSalario) => TIPOS[r.ptipo_sal_tipo ?? ''] || r.ptipo_sal_tipo || '—', cellClassName: 'hidden sm:table-cell text-sm text-gray-500' },
];

export default function TiposSalarioPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<TipoSalario | null>(null);
  const [form, setForm] = useState({ ptipo_sal_desc: '', ptipo_sal_dias_trab: '', ptipo_sal_tipo: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['tipos-salario', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getTiposSalario({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['tipos-salario'] });

  const createMut = useMutation({ mutationFn: createTipoSalario, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<TipoSalario> }) => updateTipoSalario(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteTipoSalario, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ ptipo_sal_desc: '', ptipo_sal_dias_trab: '', ptipo_sal_tipo: '' }); setError(''); setModal(true); };
  const openEdit = (r: TipoSalario) => { setEditing(r); setForm({ ptipo_sal_desc: r.ptipo_sal_desc, ptipo_sal_dias_trab: r.ptipo_sal_dias_trab?.toString() ?? '', ptipo_sal_tipo: r.ptipo_sal_tipo ?? '' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.ptipo_sal_desc.trim()) { setError('La descripción es requerida'); return; }
    const payload = { ptipo_sal_desc: form.ptipo_sal_desc, ptipo_sal_dias_trab: form.ptipo_sal_dias_trab ? Number(form.ptipo_sal_dias_trab) : null, ptipo_sal_tipo: form.ptipo_sal_tipo || null };
    if (editing) updateMut.mutate({ id: editing.ptipo_sal_codigo, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tipos de salario</h1>
          <p className="text-sm text-gray-500 mt-0.5">Modalidades de cálculo salarial</p>
        </div>
        <PrimaryAddButton label="Nuevo tipo" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.ptipo_sal_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.ptipo_sal_codigo)}
          deleteConfirmMessage="¿Eliminar este tipo de salario?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar tipo de salario' : 'Nuevo tipo de salario'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.ptipo_sal_desc} onChange={(e) => setForm((f) => ({ ...f, ptipo_sal_desc: e.target.value }))} placeholder="Ej: Mensual" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días de trabajo</label>
                <input type="number" value={form.ptipo_sal_dias_trab} onChange={(e) => setForm((f) => ({ ...f, ptipo_sal_dias_trab: e.target.value }))} placeholder="Ej: 30" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={form.ptipo_sal_tipo} onChange={(e) => setForm((f) => ({ ...f, ptipo_sal_tipo: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Seleccionar —</option>
                  <option value="M">Mensual</option>
                  <option value="H">Hora</option>
                  <option value="D">Día</option>
                  <option value="DJ">Destajo</option>
                </select>
              </div>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
