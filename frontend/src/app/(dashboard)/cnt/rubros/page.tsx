'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRubros, createRubro, updateRubro, deleteRubro } from '@/services/cnt';
import type { RubroCuenta } from '@/types/cnt';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'codigo', header: 'Código', sortKey: 'codigo', headerClassName: 'w-20', cell: (r: RubroCuenta) => r.RUB_CODIGO, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc', cell: (r: RubroCuenta) => r.RUB_DESC, cellClassName: 'font-medium text-gray-800' },
];

export default function RubrosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editItem, setEditItem] = useState<RubroCuenta | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formDesc, setFormDesc] = useState('');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['cnt-rubros', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getRubros({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const createMut = useMutation({ mutationFn: createRubro, onSuccess: () => { qc.invalidateQueries({ queryKey: ['cnt-rubros'] }); setShowModal(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => updateRubro(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['cnt-rubros'] }); setShowModal(false); } });
  const deleteMut = useMutation({ mutationFn: deleteRubro, onSuccess: () => qc.invalidateQueries({ queryKey: ['cnt-rubros'] }) });

  const openNew = () => { setEditItem(null); setFormDesc(''); setShowModal(true); };
  const openEdit = (r: RubroCuenta) => { setEditItem(r); setFormDesc(r.RUB_DESC); setShowModal(true); };
  const handleSave = () => {
    if (!formDesc.trim()) return;
    if (editItem) updateMut.mutate({ id: editItem.RUB_CODIGO, data: { desc: formDesc } });
    else createMut.mutate({ desc: formDesc });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Rubros contables</h1>
          <p className="text-sm text-gray-500 mt-0.5">Clasificación de rubros del plan de cuentas</p>
        </div>
        <PrimaryAddButton label="Nuevo rubro" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar rubro..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.RUB_CODIGO} columns={COLUMNS}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.RUB_CODIGO)} deleteConfirmMessage="¿Eliminar este rubro?"
          tableClassName="w-full text-sm min-w-[300px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editItem ? 'Editar rubro' : 'Nuevo rubro'}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
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
