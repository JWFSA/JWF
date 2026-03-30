'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGrupos, createGrupo, updateGrupo, deleteGrupo } from '@/services/cnt';
import type { GrupoCuenta } from '@/types/cnt';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const SALDO: Record<string, string> = { D: 'Deudor', C: 'Acreedor' };

const COLUMNS = [
  { key: 'codigo', header: 'Código', sortKey: 'codigo', headerClassName: 'w-20', cell: (r: GrupoCuenta) => r.GRUP_CODIGO, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc', cell: (r: GrupoCuenta) => r.GRUP_DESC, cellClassName: 'font-medium text-gray-800' },
  { key: 'saldo',  header: 'Saldo normal', headerClassName: 'w-28', cell: (r: GrupoCuenta) => SALDO[r.GRUP_SALDO_NORMAL] ?? r.GRUP_SALDO_NORMAL, cellClassName: 'text-xs text-gray-500' },
];

export default function GruposPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editItem, setEditItem] = useState<GrupoCuenta | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formDesc, setFormDesc] = useState('');
  const [formSaldo, setFormSaldo] = useState('D');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['cnt-grupos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getGrupos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const createMut = useMutation({ mutationFn: createGrupo, onSuccess: () => { qc.invalidateQueries({ queryKey: ['cnt-grupos'] }); setShowModal(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => updateGrupo(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['cnt-grupos'] }); setShowModal(false); } });
  const deleteMut = useMutation({ mutationFn: deleteGrupo, onSuccess: () => qc.invalidateQueries({ queryKey: ['cnt-grupos'] }) });

  const openNew = () => { setEditItem(null); setFormDesc(''); setFormSaldo('D'); setShowModal(true); };
  const openEdit = (r: GrupoCuenta) => { setEditItem(r); setFormDesc(r.GRUP_DESC); setFormSaldo(r.GRUP_SALDO_NORMAL); setShowModal(true); };
  const handleSave = () => {
    if (!formDesc.trim()) return;
    if (editItem) updateMut.mutate({ id: editItem.GRUP_CODIGO, data: { desc: formDesc, saldo_normal: formSaldo } });
    else createMut.mutate({ desc: formDesc, saldo_normal: formSaldo });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Grupos de cuentas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Clasificación principal del plan de cuentas</p>
        </div>
        <PrimaryAddButton label="Nuevo grupo" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar grupo..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.GRUP_CODIGO} columns={COLUMNS}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.GRUP_CODIGO)} deleteConfirmMessage="¿Eliminar este grupo?"
          tableClassName="w-full text-sm min-w-[400px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editItem ? 'Editar grupo' : 'Nuevo grupo'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saldo normal</label>
                <select value={formSaldo} onChange={(e) => setFormSaldo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="D">Deudor</option>
                  <option value="C">Acreedor</option>
                </select>
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
