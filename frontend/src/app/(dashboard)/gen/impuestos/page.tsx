'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getImpuestos, createImpuesto, updateImpuesto, deleteImpuesto } from '@/services/gen';
import type { Impuesto } from '@/types/gen';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

type ModalState = null | 'nuevo' | Impuesto;
const empty = { impu_desc: '', impu_porcentaje: 0, impu_incluido: 'N' as 'S' | 'N', impu_porc_base_imponible: 100, impu_cod_set: 1 };

export default function ImpuestosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['impuestos', { page, limit, search: debouncedSearch }],
    queryFn: () => getImpuestos({ page, limit, search: debouncedSearch }),
  });

  const impuestos = data?.data ?? [];
  const pagination = data?.pagination;
  const inv = () => qc.invalidateQueries({ queryKey: ['impuestos'] });

  const openNuevo  = () => { setForm(empty); setError(''); setModal('nuevo'); };
  const openEditar = (i: Impuesto) => {
    setForm({ impu_desc: i.impu_desc, impu_porcentaje: i.impu_porcentaje, impu_incluido: i.impu_incluido, impu_porc_base_imponible: i.impu_porc_base_imponible, impu_cod_set: i.impu_cod_set });
    setError(''); setModal(i);
  };

  const createMut = useMutation({ mutationFn: createImpuesto, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateImpuesto(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteImpuesto, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.impu_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nuevo' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Impuesto).impu_codigo, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Impuestos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tasas de impuesto (IVA, etc.)</p>
        </div>
        <PrimaryAddButton label="Nuevo impuesto" shortLabel="Nuevo" onClick={openNuevo} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar impuesto..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={impuestos}
          getRowKey={(i) => i.impu_codigo}
          onEdit={openEditar}
          onDelete={(i) => deleteMut.mutate(i.impu_codigo)}
          deleteConfirmMessage="¿Eliminar este impuesto?"
          tableClassName="w-full min-w-[500px] text-sm"
          columns={[
            { key: 'codigo', header: 'Cód.', headerClassName: 'w-16', cell: (i) => i.impu_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
            { key: 'desc', header: 'Descripción', cell: (i) => i.impu_desc, cellClassName: 'font-medium text-gray-800' },
            { key: 'porc', header: '%', headerClassName: 'w-20 text-right', cell: (i) => `${i.impu_porcentaje}%`, cellClassName: 'text-right text-gray-700' },
            { key: 'base', header: '% Base imp.', headerClassName: 'hidden md:table-cell w-32 text-right', cell: (i) => `${i.impu_porc_base_imponible}%`, cellClassName: 'hidden md:table-cell text-right text-gray-500' },
            {
              key: 'incluido', header: 'Incluido', headerClassName: 'hidden sm:table-cell text-center',
              cell: (i) => i.impu_incluido === 'S'
                ? <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Sí</span>
                : <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">No</span>,
              cellClassName: 'hidden sm:table-cell text-center',
            },
          ]}
        />
        {pagination && (
          <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
        )}
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nuevo' ? 'Nuevo impuesto' : `Editar: ${(modal as Impuesto).impu_desc}`}
          onClose={() => setModal(null)} onSubmit={handleSubmit} isPending={isPending} error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.impu_desc} onChange={(e) => setForm({ ...form, impu_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje (%)</label>
              <input type="number" step="0.01" value={form.impu_porcentaje}
                onChange={(e) => setForm({ ...form, impu_porcentaje: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">% Base imponible</label>
              <input type="number" step="0.01" value={form.impu_porc_base_imponible}
                onChange={(e) => setForm({ ...form, impu_porc_base_imponible: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="incluido" checked={form.impu_incluido === 'S'}
              onChange={(e) => setForm({ ...form, impu_incluido: e.target.checked ? 'S' : 'N' })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="incluido" className="text-sm text-gray-700">IVA incluido en el precio</label>
          </div>
        </FormModal>
      )}
    </div>
  );
}
