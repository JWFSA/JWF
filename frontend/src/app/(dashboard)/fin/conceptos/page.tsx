'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConceptosFin, createConceptoFin, updateConceptoFin, deleteConceptoFin } from '@/services/fin';
import type { ConceptoFin } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const TIPO_SALDO: Record<string, string> = { D: 'Débito', C: 'Crédito' };

const COLUMNS = [
  { key: 'codigo', header: 'Código',   sortKey: 'codigo', headerClassName: 'w-20', cell: (r: ConceptoFin) => r.fcon_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc', cell: (r: ConceptoFin) => r.fcon_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'tipo',   header: 'Tipo',     sortKey: 'tipo', headerClassName: 'hidden sm:table-cell w-20', cell: (r: ConceptoFin) => TIPO_SALDO[r.fcon_tipo_saldo ?? ''] ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
];

export default function ConceptosFinPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('codigo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editItem, setEditItem] = useState<ConceptoFin | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formDesc, setFormDesc] = useState('');
  const [formTipo, setFormTipo] = useState('D');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['fin-conceptos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getConceptosFin({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const createMut = useMutation({ mutationFn: createConceptoFin, onSuccess: () => { qc.invalidateQueries({ queryKey: ['fin-conceptos'] }); setShowModal(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => updateConceptoFin(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['fin-conceptos'] }); setShowModal(false); } });
  const deleteMut = useMutation({ mutationFn: deleteConceptoFin, onSuccess: () => qc.invalidateQueries({ queryKey: ['fin-conceptos'] }) });

  const openNew = () => { setEditItem(null); setFormDesc(''); setFormTipo('D'); setShowModal(true); };
  const openEdit = (r: ConceptoFin) => { setEditItem(r); setFormDesc(r.fcon_desc); setFormTipo(r.fcon_tipo_saldo ?? 'D'); setShowModal(true); };
  const handleSave = () => {
    if (!formDesc.trim()) return;
    if (editItem) updateMut.mutate({ id: editItem.fcon_clave, data: { fcon_desc: formDesc, fcon_tipo_saldo: formTipo } });
    else createMut.mutate({ fcon_desc: formDesc, fcon_tipo_saldo: formTipo });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Conceptos financieros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Conceptos para imputación de documentos</p>
        </div>
        <PrimaryAddButton label="Nuevo concepto" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por código o descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.fcon_clave} columns={COLUMNS}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.fcon_clave)} deleteConfirmMessage="¿Eliminar este concepto?"
          tableClassName="w-full text-sm min-w-[350px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editItem ? 'Editar concepto' : 'Nuevo concepto'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de saldo</label>
                <select value={formTipo} onChange={(e) => setFormTipo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="D">Débito</option>
                  <option value="C">Crédito</option>
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
