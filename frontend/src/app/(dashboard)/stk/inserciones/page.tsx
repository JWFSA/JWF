'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInserciones, createInsercion, updateInsercion, deleteInsercion } from '@/services/stk';
import type { Insercion } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const empty = { ins_desc: '', ins_seg: 10, ins_inserciones: 0 };

const fmt = (n?: number | null) => n != null ? Number(n).toLocaleString('es-PY') : '—';

const COLUMNS = [
  { key: 'codigo', header: 'Código', sortKey: 'cod', headerClassName: 'w-20', cell: (i: Insercion) => i.ins_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc', cell: (i: Insercion) => i.ins_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'seg',    header: 'Segundos', sortKey: 'seg', headerClassName: 'text-right w-24', cell: (i: Insercion) => fmt(i.ins_seg), cellClassName: 'text-right tabular-nums text-gray-600' },
  { key: 'ins',    header: 'Inserciones', sortKey: 'ins', headerClassName: 'text-right w-28', cell: (i: Insercion) => fmt(i.ins_inserciones), cellClassName: 'text-right tabular-nums text-gray-600' },
  { key: 'total',  header: 'Total seg.', sortKey: 'total', headerClassName: 'text-right w-28', cell: (i: Insercion) => fmt(i.ins_total), cellClassName: 'text-right tabular-nums font-semibold text-gray-800' },
];

export default function InsercionesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('cod');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState<null | 'nueva' | Insercion>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['inserciones', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getInserciones({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const inserciones = data?.data ?? [];
  const pagination  = data?.pagination;

  const inv = () => qc.invalidateQueries({ queryKey: ['inserciones'] });
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const openNueva  = () => { setForm(empty); setError(''); setModal('nueva'); };
  const openEditar = (i: Insercion) => { setForm({ ins_desc: i.ins_desc, ins_seg: i.ins_seg, ins_inserciones: i.ins_inserciones }); setError(''); setModal(i); };

  const createMut = useMutation({ mutationFn: createInsercion, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateInsercion(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteInsercion, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.ins_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nueva' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Insercion).ins_codigo, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;
  const totalCalc = (form.ins_seg || 0) * (form.ins_inserciones || 0);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Inserciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Paquetes de inserciones publicitarias</p>
        </div>
        <PrimaryAddButton label="Nueva inserción" shortLabel="Nueva" onClick={openNueva} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar inserción..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={inserciones}
          getRowKey={(i) => i.ins_codigo}
          onEdit={openEditar}
          onDelete={(i) => deleteMut.mutate(i.ins_codigo)}
          deleteConfirmMessage="¿Eliminar esta inserción?"
          columns={COLUMNS}
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
        />

        {pagination && (
          <TablePagination
            total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nueva' ? 'Nueva inserción' : `Editar: ${(modal as Insercion).ins_desc}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.ins_desc} onChange={(e) => setForm({ ...form, ins_desc: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Segundos</label>
                <input type="number" min="0" value={form.ins_seg} onChange={(e) => setForm({ ...form, ins_seg: Number(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inserciones</label>
                <input type="number" min="0" value={form.ins_inserciones} onChange={(e) => setForm({ ...form, ins_inserciones: Number(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <span className="text-gray-500">Total segundos:</span>
              <span className="ml-2 font-bold text-gray-800">{fmt(totalCalc)}</span>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
