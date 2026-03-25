'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCiudades, createCiudad, updateCiudad, deleteCiudad } from '@/services/gen';
import type { Ciudad } from '@/types/gen';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

type ModalState = null | 'nueva' | Ciudad;
const empty = { ciudad_desc: '' };

export default function CiudadesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['ciudades', { page, limit, search: debouncedSearch }],
    queryFn: () => getCiudades({ page, limit, search: debouncedSearch }),
  });

  const ciudades = data?.data ?? [];
  const pagination = data?.pagination;
  const inv = () => qc.invalidateQueries({ queryKey: ['ciudades'] });

  const openNueva  = () => { setForm(empty); setError(''); setModal('nueva'); };
  const openEditar = (c: Ciudad) => { setForm({ ciudad_desc: c.ciudad_desc }); setError(''); setModal(c); };

  const createMut = useMutation({ mutationFn: createCiudad, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateCiudad(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteCiudad, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.ciudad_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nueva' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Ciudad).ciudad_codigo, data: form });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Ciudades</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catálogo de ciudades</p>
        </div>
        <PrimaryAddButton label="Nueva ciudad" shortLabel="Nueva" onClick={openNueva} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar ciudad..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={ciudades}
          getRowKey={(c) => c.ciudad_codigo}
          onEdit={openEditar}
          onDelete={(c) => deleteMut.mutate(c.ciudad_codigo)}
          deleteConfirmMessage="¿Eliminar esta ciudad?"
          columns={[
            { key: 'codigo', header: 'Código', headerClassName: 'w-24', cell: (c) => c.ciudad_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
            { key: 'desc', header: 'Ciudad', cell: (c) => c.ciudad_desc, cellClassName: 'font-medium text-gray-800' },
          ]}
        />
        {pagination && (
          <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
        )}
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nueva' ? 'Nueva ciudad' : `Editar: ${(modal as Ciudad).ciudad_desc}`}
          onClose={() => setModal(null)} onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending} error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.ciudad_desc} onChange={(e) => setForm({ ciudad_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
