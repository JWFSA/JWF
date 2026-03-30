'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChoferes, createChofer, updateChofer, deleteChofer } from '@/services/stk';
import type { Chofer } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'codigo',  header: 'Código',  sortKey: 'cod',    headerClassName: 'w-20', cell: (r: Chofer) => r.chof_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'nombre',  header: 'Nombre',  sortKey: 'nombre', cell: (r: Chofer) => r.chof_nombre, cellClassName: 'font-medium text-gray-800' },
  { key: 'cedula',  header: 'Cédula',  headerClassName: 'hidden sm:table-cell w-28', cell: (r: Chofer) => r.chof_cedula ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'vehic',   header: 'Vehículo', headerClassName: 'hidden md:table-cell w-28', cell: (r: Chofer) => r.chof_veh_marca ?? '—', cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'chapa',   header: 'Chapa',   headerClassName: 'hidden md:table-cell w-24', cell: (r: Chofer) => r.chof_veh_chapa ?? '—', cellClassName: 'hidden md:table-cell font-mono text-xs text-gray-500' },
];

export default function ChoferesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('nombre');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editItem, setEditItem] = useState<Chofer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formNombre, setFormNombre] = useState('');
  const [formCedula, setFormCedula] = useState('');
  const [formMarca, setFormMarca] = useState('');
  const [formChapa, setFormChapa] = useState('');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['stk-choferes', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getChoferes({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const createMut = useMutation({ mutationFn: createChofer, onSuccess: () => { qc.invalidateQueries({ queryKey: ['stk-choferes'] }); setShowModal(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => updateChofer(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['stk-choferes'] }); setShowModal(false); } });
  const deleteMut = useMutation({ mutationFn: deleteChofer, onSuccess: () => qc.invalidateQueries({ queryKey: ['stk-choferes'] }) });

  const openNew = () => { setEditItem(null); setFormNombre(''); setFormCedula(''); setFormMarca(''); setFormChapa(''); setShowModal(true); };
  const openEdit = (r: Chofer) => { setEditItem(r); setFormNombre(r.chof_nombre); setFormCedula(r.chof_cedula?.toString() ?? ''); setFormMarca(r.chof_veh_marca ?? ''); setFormChapa(r.chof_veh_chapa ?? ''); setShowModal(true); };
  const handleSave = () => {
    if (!formNombre.trim()) return;
    const d = { chof_nombre: formNombre, chof_cedula: formCedula ? Number(formCedula) : null, chof_veh_marca: formMarca || null, chof_veh_chapa: formChapa || null };
    if (editItem) updateMut.mutate({ id: editItem.chof_codigo, data: d });
    else createMut.mutate(d);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Choferes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Choferes para remisiones y despachos</p>
        </div>
        <PrimaryAddButton label="Nuevo chofer" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre o cédula..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.chof_codigo} columns={COLUMNS}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.chof_codigo)} deleteConfirmMessage="¿Eliminar este chofer?"
          tableClassName="w-full text-sm min-w-[350px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editItem ? 'Editar chofer' : 'Nuevo chofer'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input value={formNombre} onChange={(e) => setFormNombre(e.target.value)} autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                <input type="number" value={formCedula} onChange={(e) => setFormCedula(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo (marca)</label>
                <input value={formMarca} onChange={(e) => setFormMarca(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapa</label>
                <input value={formChapa} onChange={(e) => setFormChapa(e.target.value)}
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
