'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCobradores, createCobrador, updateCobrador, deleteCobrador } from '@/services/fin';
import type { Cobrador } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'codigo',   header: 'Código',    headerClassName: 'w-20', cell: (r: Cobrador) => r.cob_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'nombre',   header: 'Empleado',  cell: (r: Cobrador) => `${r.empl_nombre ?? ''} ${r.empl_ape ?? ''}`.trim() || `Cód. ${r.cob_codigo}`, cellClassName: 'font-medium text-gray-800' },
  { key: 'comision', header: '% Comisión', headerClassName: 'w-28 text-right', cell: (r: Cobrador) => r.cob_porc_comision != null ? `${r.cob_porc_comision}%` : '—', cellClassName: 'text-right tabular-nums text-gray-600' },
];

export default function CobradoresPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [editItem, setEditItem] = useState<Cobrador | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formCodigo, setFormCodigo] = useState('');
  const [formComision, setFormComision] = useState('0');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['fin-cobradores', { page, limit, search: debouncedSearch }],
    queryFn: () => getCobradores({ page, limit, search: debouncedSearch }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const createMut = useMutation({ mutationFn: createCobrador, onSuccess: () => { qc.invalidateQueries({ queryKey: ['fin-cobradores'] }); setShowModal(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => updateCobrador(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['fin-cobradores'] }); setShowModal(false); } });
  const deleteMut = useMutation({ mutationFn: deleteCobrador, onSuccess: () => qc.invalidateQueries({ queryKey: ['fin-cobradores'] }) });

  const openNew = () => { setEditItem(null); setFormCodigo(''); setFormComision('0'); setShowModal(true); };
  const openEdit = (r: Cobrador) => { setEditItem(r); setFormCodigo(String(r.cob_codigo)); setFormComision(String(r.cob_porc_comision ?? 0)); setShowModal(true); };
  const handleSave = () => {
    if (editItem) updateMut.mutate({ id: editItem.cob_codigo, data: { cob_porc_comision: Number(formComision) } });
    else {
      if (!formCodigo) return;
      createMut.mutate({ cob_codigo: Number(formCodigo), cob_porc_comision: Number(formComision) });
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Cobradores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Empleados asignados como cobradores</p>
        </div>
        <PrimaryAddButton label="Nuevo cobrador" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por código o nombre..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.cob_codigo} columns={COLUMNS}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.cob_codigo)} deleteConfirmMessage="¿Eliminar este cobrador?"
          tableClassName="w-full text-sm min-w-[350px]" />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editItem ? 'Editar cobrador' : 'Nuevo cobrador'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código (legajo) {!editItem && <span className="text-red-500">*</span>}</label>
                <input type="number" value={formCodigo} onChange={(e) => setFormCodigo(e.target.value)} disabled={!!editItem}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Comisión</label>
                <input type="number" min="0" max="100" step="0.01" value={formComision} onChange={(e) => setFormComision(e.target.value)}
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
