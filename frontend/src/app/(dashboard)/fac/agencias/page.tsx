'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAgencias, createAgencia, updateAgencia, deleteAgencia } from '@/services/fac';
import type { Agencia } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

type ModalState = null | 'nueva' | Agencia;
const empty = { agen_desc: '', agen_est: 'A' };

const COLUMNS = [
  { key: 'codigo', header: 'Código',      sortKey: 'cod',  headerClassName: 'w-24', cell: (a: Agencia) => a.agen_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc',                          cell: (a: Agencia) => a.agen_desc,   cellClassName: 'font-medium text-gray-800' },
  { key: 'est',    header: 'Estado',       headerClassName: 'w-24',                  cell: (a: Agencia) => a.agen_est === 'A' ? 'Activo' : 'Inactivo', cellClassName: 'text-xs text-gray-500' },
];

export default function AgenciasPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['agencias', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getAgencias({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const agencias = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['agencias'] });

  const openNueva  = () => { setForm(empty); setError(''); setModal('nueva'); };
  const openEditar = (a: Agencia) => { setForm({ agen_desc: a.agen_desc, agen_est: a.agen_est ?? 'A' }); setError(''); setModal(a); };

  const createMut = useMutation({ mutationFn: createAgencia, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateAgencia(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteAgencia, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.agen_desc.trim()) { setError('La descripción es requerida'); return; }
    const data = { ...form, agen_desc: form.agen_desc.toUpperCase() };
    modal === 'nueva' ? createMut.mutate(data) : updateMut.mutate({ id: (modal as Agencia).agen_codigo, data });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Agencias</h1>
          <p className="text-sm text-gray-500 mt-0.5">Agencias de venta indirecta</p>
        </div>
        <PrimaryAddButton label="Nueva agencia" shortLabel="Nueva" onClick={openNueva} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar agencia..." />
        </div>
        <DataTable isLoading={isLoading} rows={agencias} getRowKey={(a) => a.agen_codigo}
          onEdit={openEditar} onDelete={(a) => deleteMut.mutate(a.agen_codigo)}
          deleteConfirmMessage="¿Eliminar esta agencia?"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal !== null && (
        <FormModal title={modal === 'nueva' ? 'Nueva agencia' : `Editar: ${(modal as Agencia).agen_desc}`}
          onClose={() => setModal(null)} onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.agen_desc} onChange={(e) => setForm({ ...form, agen_desc: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.agen_est} onChange={(e) => setForm({ ...form, agen_est: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
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
