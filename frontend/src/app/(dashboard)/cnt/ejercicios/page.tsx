'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEjercicios, createEjercicio, updateEjercicio, deleteEjercicio } from '@/services/cnt';
import { formatDate, toInputDate } from '@/lib/utils';
import type { Ejercicio } from '@/types/cnt';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

const COLUMNS = [
  { key: 'codigo',    header: 'Código',     sortKey: 'codigo',    headerClassName: 'w-20', cell: (r: Ejercicio) => r.ej_codigo,                    cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha_ini', header: 'Fecha inicio', sortKey: 'fecha_ini', headerClassName: 'w-28', cell: (r: Ejercicio) => formatDate(r.ej_fec_inicial),  cellClassName: 'text-xs text-gray-600' },
  { key: 'fecha_fin', header: 'Fecha fin',    sortKey: 'fecha_fin', headerClassName: 'w-28', cell: (r: Ejercicio) => formatDate(r.ej_fec_final),    cellClassName: 'text-xs text-gray-600' },
  { key: 'utilidad',  header: 'Utilidad',     headerClassName: 'hidden md:table-cell w-36 text-right', cell: (r: Ejercicio) => fmt(r.ej_utilidad),   cellClassName: 'hidden md:table-cell text-right tabular-nums text-gray-700' },
];

export default function EjerciciosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('codigo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editItem, setEditItem] = useState<Ejercicio | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formFecIni, setFormFecIni] = useState('');
  const [formFecFin, setFormFecFin] = useState('');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['cnt-ejercicios', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getEjercicios({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const createMut = useMutation({ mutationFn: createEjercicio, onSuccess: () => { qc.invalidateQueries({ queryKey: ['cnt-ejercicios'] }); setShowModal(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => updateEjercicio(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['cnt-ejercicios'] }); setShowModal(false); } });
  const deleteMut = useMutation({ mutationFn: deleteEjercicio, onSuccess: () => qc.invalidateQueries({ queryKey: ['cnt-ejercicios'] }) });

  const openNew = () => { setEditItem(null); setFormFecIni(''); setFormFecFin(''); setShowModal(true); };
  const openEdit = (r: Ejercicio) => { setEditItem(r); setFormFecIni(toInputDate(r.ej_fec_inicial)); setFormFecFin(toInputDate(r.ej_fec_final)); setShowModal(true); };
  const handleSave = () => {
    if (!formFecIni || !formFecFin) return;
    if (editItem) updateMut.mutate({ id: editItem.ej_codigo, data: { ej_fec_inicial: formFecIni, ej_fec_final: formFecFin } });
    else createMut.mutate({ ej_fec_inicial: formFecIni, ej_fec_final: formFecFin });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Ejercicios contables</h1>
          <p className="text-sm text-gray-500 mt-0.5">Períodos fiscales anuales</p>
        </div>
        <PrimaryAddButton label="Nuevo ejercicio" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por código..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.ej_codigo} columns={COLUMNS}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.ej_codigo)} deleteConfirmMessage="¿Eliminar este ejercicio?"
          tableClassName="w-full text-sm min-w-[400px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editItem ? 'Editar ejercicio' : 'Nuevo ejercicio'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio <span className="text-red-500">*</span></label>
                <input type="date" value={formFecIni} onChange={(e) => setFormFecIni(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin <span className="text-red-500">*</span></label>
                <input type="date" value={formFecFin} onChange={(e) => setFormFecFin(e.target.value)}
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
