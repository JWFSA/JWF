'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaises, createPais, updatePais, deletePais } from '@/services/gen';
import type { Pais } from '@/types/gen';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import DataTable from '@/components/ui/DataTable';

const empty = { pais_desc: '', pais_nacionalidad: '' };

const COLUMNS = [
  { key: 'codigo',       header: 'Código',       headerClassName: 'w-24', cell: (p: Pais) => p.pais_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',         header: 'País',          cell: (p: Pais) => p.pais_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'nacionalidad', header: 'Nacionalidad',  headerClassName: 'hidden sm:table-cell', cell: (p: Pais) => p.pais_nacionalidad ?? '—', cellClassName: 'text-gray-500 hidden sm:table-cell' },
];

function matchesPais(p: Pais, q: string) {
  const s = `${p.pais_codigo} ${p.pais_desc} ${p.pais_nacionalidad ?? ''}`.toLowerCase();
  return s.includes(q);
}

export default function PaisesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'nuevo' | Pais>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: paisesRaw = [], isLoading } = useQuery({ queryKey: ['paises'], queryFn: getPaises });

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return paisesRaw;
    return paisesRaw.filter((p) => matchesPais(p, q));
  }, [paisesRaw, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paises = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, safePage, limit]);

  const inv = () => qc.invalidateQueries({ queryKey: ['paises'] });

  const openNuevo  = () => { setForm(empty); setError(''); setModal('nuevo'); };
  const openEditar = (p: Pais) => { setForm({ pais_desc: p.pais_desc, pais_nacionalidad: p.pais_nacionalidad ?? '' }); setError(''); setModal(p); };

  const createMut = useMutation({ mutationFn: createPais, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updatePais(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deletePais, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.pais_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nuevo' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Pais).pais_codigo, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Países</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catálogo de países</p>
        </div>
        <PrimaryAddButton label="Nuevo país" shortLabel="Nuevo" onClick={openNuevo} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar país..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={paises}
          getRowKey={(p) => p.pais_codigo}
          onEdit={openEditar}
          onDelete={(p) => deleteMut.mutate(p.pais_codigo)}
          deleteConfirmMessage="¿Eliminar este país?"
          tableClassName="w-full min-w-[400px] text-sm"
          emptyLabel="Sin registros"
          columns={COLUMNS}
        />

        {!isLoading && (
          <TablePagination
            total={filtered.length}
            page={safePage}
            limit={limit}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nuevo' ? 'Nuevo país' : `Editar: ${(modal as Pais).pais_desc}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.pais_desc} onChange={(e) => setForm({ ...form, pais_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
            <input value={form.pais_nacionalidad} onChange={(e) => setForm({ ...form, pais_nacionalidad: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: Paraguayo, Argentino" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
