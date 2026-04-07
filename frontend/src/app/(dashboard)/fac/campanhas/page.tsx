'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCampanhas, createCampanha, updateCampanha, deleteCampanha } from '@/services/fac';
import type { Campanha } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'nombre',  header: 'Nombre',   sortKey: 'nombre',  cell: (r: Campanha) => r.camp_nombre, cellClassName: 'font-medium text-gray-800' },
  { key: 'cliente', header: 'Cliente',   sortKey: 'cliente', headerClassName: 'hidden md:table-cell', cell: (r: Campanha) => r.cli_nom ?? `Cód. ${r.camp_cli}`, cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'vigente', header: 'Vigente',   sortKey: 'vigente', headerClassName: 'w-20', cell: (r: Campanha) => r.camp_ind_vigente === 'S' ? 'Sí' : 'No', cellClassName: 'text-xs text-gray-500' },
];

export default function CampanhasPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('nombre');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editItem, setEditItem] = useState<Campanha | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formNombre, setFormNombre] = useState('');
  const [formVigente, setFormVigente] = useState('S');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['fac-campanhas', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getCampanhas({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const createMut = useMutation({ mutationFn: createCampanha, onSuccess: () => { qc.invalidateQueries({ queryKey: ['fac-campanhas'] }); setShowModal(false); } });
  const updateMut = useMutation({ mutationFn: ({ cli, nro, data }: { cli: number; nro: number; data: any }) => updateCampanha(cli, nro, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['fac-campanhas'] }); setShowModal(false); } });
  const deleteMut = useMutation({ mutationFn: (r: Campanha) => deleteCampanha(r.camp_cli, r.camp_nro), onSuccess: () => qc.invalidateQueries({ queryKey: ['fac-campanhas'] }) });

  const openNew = () => { setEditItem(null); setFormNombre(''); setFormVigente('S'); setShowModal(true); };
  const openEdit = (r: Campanha) => { setEditItem(r); setFormNombre(r.camp_nombre); setFormVigente(r.camp_ind_vigente ?? 'S'); setShowModal(true); };
  const handleSave = () => {
    if (!formNombre.trim()) return;
    if (editItem) updateMut.mutate({ cli: editItem.camp_cli, nro: editItem.camp_nro, data: { camp_nombre: formNombre, camp_ind_vigente: formVigente } });
    else createMut.mutate({ camp_nombre: formNombre, camp_ind_vigente: formVigente });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Marcas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Marcas por cliente</p>
        </div>
        <PrimaryAddButton label="Nueva marca" shortLabel="Nueva" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre o cliente..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => `${r.camp_cli}-${r.camp_nro}`} columns={COLUMNS}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r)} deleteConfirmMessage="¿Eliminar esta marca?"
          tableClassName="w-full text-sm min-w-[350px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editItem ? 'Editar marca' : 'Nueva marca'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input value={formNombre} onChange={(e) => setFormNombre(e.target.value)} autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vigente</label>
                <select value={formVigente} onChange={(e) => setFormVigente(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="S">Sí</option>
                  <option value="N">No</option>
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
