'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPeriodos, createPeriodo, updatePeriodo, deletePeriodo } from '@/services/fin';
import { formatDate, toInputDate } from '@/lib/utils';
import type { PeriodoFin } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'codigo',  header: 'Código',      sortKey: 'codigo',  headerClassName: 'w-20', cell: (r: PeriodoFin) => r.peri_codigo,              cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fec_ini', header: 'Fecha inicio', sortKey: 'fec_ini', headerClassName: 'w-28', cell: (r: PeriodoFin) => formatDate(r.peri_fec_ini), cellClassName: 'text-xs text-gray-600' },
  { key: 'fec_fin', header: 'Fecha fin',    sortKey: 'fec_fin', headerClassName: 'w-28', cell: (r: PeriodoFin) => formatDate(r.peri_fec_fin), cellClassName: 'text-xs text-gray-600' },
];

export default function PeriodosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('codigo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editItem, setEditItem] = useState<PeriodoFin | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formIni, setFormIni] = useState('');
  const [formFin, setFormFin] = useState('');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['fin-periodos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getPeriodos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const createMut = useMutation({ mutationFn: createPeriodo, onSuccess: () => { qc.invalidateQueries({ queryKey: ['fin-periodos'] }); setShowModal(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => updatePeriodo(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['fin-periodos'] }); setShowModal(false); } });
  const deleteMut = useMutation({ mutationFn: deletePeriodo, onSuccess: () => qc.invalidateQueries({ queryKey: ['fin-periodos'] }) });

  const openNew = () => { setEditItem(null); setFormIni(''); setFormFin(''); setShowModal(true); };
  const openEdit = (r: PeriodoFin) => { setEditItem(r); setFormIni(toInputDate(r.peri_fec_ini)); setFormFin(toInputDate(r.peri_fec_fin)); setShowModal(true); };
  const handleSave = () => {
    if (!formIni || !formFin) return;
    if (editItem) updateMut.mutate({ id: editItem.peri_codigo, data: { peri_fec_ini: formIni, peri_fec_fin: formFin } });
    else createMut.mutate({ peri_fec_ini: formIni, peri_fec_fin: formFin });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Períodos financieros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Períodos mensuales para cierre contable</p>
        </div>
        <PrimaryAddButton label="Nuevo período" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por código..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.peri_codigo} columns={COLUMNS}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.peri_codigo)} deleteConfirmMessage="¿Eliminar este período?"
          tableClassName="w-full text-sm min-w-[350px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editItem ? 'Editar período' : 'Nuevo período'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio <span className="text-red-500">*</span></label>
                <input type="date" value={formIni} onChange={(e) => setFormIni(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin <span className="text-red-500">*</span></label>
                <input type="date" value={formFin} onChange={(e) => setFormFin(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
                {createMut.isPending || updateMut.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
