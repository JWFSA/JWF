'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '@/services/fac';
import type { Categoria } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import MoneyInput from '@/components/ui/MoneyInput';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

type ModalState = null | 'nueva' | Categoria;
const empty = { fcat_desc: '', fcat_vent_ini: 0, fcat_vent_fin: 0, fcat_atraso: 0 };

const COLUMNS = [
  { key: 'codigo',  header: 'Cód.',        sortKey: 'cod',  headerClassName: 'w-16', cell: (c: Categoria) => c.fcat_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',    header: 'Descripción', sortKey: 'desc', cell: (c: Categoria) => c.fcat_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'ini',     header: 'Venta mín.',  headerClassName: 'hidden md:table-cell text-right', cell: (c: Categoria) => c.fcat_vent_ini?.toLocaleString() ?? '—', cellClassName: 'hidden md:table-cell text-right text-gray-500' },
  { key: 'fin',     header: 'Venta máx.',  headerClassName: 'hidden md:table-cell text-right', cell: (c: Categoria) => c.fcat_vent_fin?.toLocaleString() ?? '—', cellClassName: 'hidden md:table-cell text-right text-gray-500' },
  { key: 'atraso',  header: 'Días atraso', headerClassName: 'hidden lg:table-cell text-right', cell: (c: Categoria) => c.fcat_atraso, cellClassName: 'hidden lg:table-cell text-right text-gray-500' },
];

export default function CategoriasPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['categorias', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getCategorias({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const categorias = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['categorias'] });

  const openNueva  = () => { setForm(empty); setError(''); setModal('nueva'); };
  const openEditar = (c: Categoria) => { setForm({ fcat_desc: c.fcat_desc, fcat_vent_ini: c.fcat_vent_ini, fcat_vent_fin: c.fcat_vent_fin, fcat_atraso: c.fcat_atraso }); setError(''); setModal(c); };

  const createMut = useMutation({ mutationFn: createCategoria, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateCategoria(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteCategoria, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.fcat_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nueva' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Categoria).fcat_codigo, data: form });
  };

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Categorías de clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Segmentación de clientes por volumen de venta</p>
        </div>
        <PrimaryAddButton label="Nueva categoría" shortLabel="Nueva" onClick={openNueva} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar categoría..." />
        </div>
        <DataTable isLoading={isLoading} rows={categorias} getRowKey={(c) => c.fcat_codigo}
          onEdit={openEditar} onDelete={(c) => deleteMut.mutate(c.fcat_codigo)}
          deleteConfirmMessage="¿Eliminar esta categoría?"
          tableClassName="w-full min-w-[500px] text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal !== null && (
        <FormModal title={modal === 'nueva' ? 'Nueva categoría' : `Editar: ${(modal as Categoria).fcat_desc}`}
          onClose={() => setModal(null)} onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.fcat_desc} onChange={(e) => setForm({ ...form, fcat_desc: e.target.value })} className={inp} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venta mínima</label>
              <MoneyInput value={form.fcat_vent_ini} onChange={(v) => setForm({ ...form, fcat_vent_ini: v })} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venta máxima</label>
              <MoneyInput value={form.fcat_vent_fin} onChange={(v) => setForm({ ...form, fcat_vent_fin: v })} className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Días de atraso permitidos</label>
            <input type="number" value={form.fcat_atraso} onChange={(e) => setForm({ ...form, fcat_atraso: Number(e.target.value) })} className={inp} />
          </div>
        </FormModal>
      )}
    </div>
  );
}
