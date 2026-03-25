'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGrupos, createGrupo, updateGrupo, deleteGrupo, getLineas } from '@/services/stk';
import type { Grupo } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

type ModalState = null | 'nuevo' | Grupo;

const empty = { grup_linea: 0, grup_desc: '', grup_coeficiente: 1 };

export default function GruposPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [lineaFiltro, setLineaFiltro] = useState<number | ''>('');
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: lineasData } = useQuery({
    queryKey: ['lineas', { all: true }],
    queryFn: () => getLineas({ all: true }),
  });
  const lineas = lineasData?.data ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ['grupos', { page, limit, search: debouncedSearch, linea: lineaFiltro }],
    queryFn: () => getGrupos({ page, limit, search: debouncedSearch, linea: lineaFiltro || undefined }),
  });

  const grupos = data?.data ?? [];
  const pagination = data?.pagination;

  const inv = () => qc.invalidateQueries({ queryKey: ['grupos'] });

  const openNuevo  = () => { setForm(empty); setError(''); setModal('nuevo'); };
  const openEditar = (g: Grupo) => { setForm({ grup_linea: g.grup_linea, grup_desc: g.grup_desc, grup_coeficiente: g.grup_coeficiente }); setError(''); setModal(g); };

  const createMut = useMutation({
    mutationFn: createGrupo,
    onSuccess: () => { inv(); setModal(null); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ linea, codigo, data }: { linea: number; codigo: number; data: Partial<Grupo> }) =>
      updateGrupo(linea, codigo, data),
    onSuccess: () => { inv(); setModal(null); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error'),
  });

  const deleteMut = useMutation({
    mutationFn: ({ linea, codigo }: { linea: number; codigo: number }) => deleteGrupo(linea, codigo),
    onSuccess: inv,
  });

  const handleSubmit = () => {
    if (!form.grup_desc.trim()) { setError('La descripción es requerida'); return; }
    if (!form.grup_linea) { setError('La línea es requerida'); return; }
    if (modal === 'nuevo') {
      createMut.mutate(form);
    } else {
      const g = modal as Grupo;
      updateMut.mutate({ linea: g.grup_linea, codigo: g.grup_codigo, data: { grup_desc: form.grup_desc, grup_coeficiente: form.grup_coeficiente } });
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Grupos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Grupos de artículos por línea</p>
        </div>
        <PrimaryAddButton label="Nuevo grupo" shortLabel="Nuevo" onClick={openNuevo} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar grupo..." />
          <select
            value={lineaFiltro}
            onChange={(e) => { setLineaFiltro(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-52"
          >
            <option value="">Todas las líneas</option>
            {lineas.map((l) => (
              <option key={l.lin_codigo} value={l.lin_codigo}>{l.lin_desc}</option>
            ))}
          </select>
        </div>

        <DataTable
          isLoading={isLoading}
          rows={grupos}
          getRowKey={(g) => `${g.grup_linea}-${g.grup_codigo}`}
          onEdit={openEditar}
          onDelete={(g) => deleteMut.mutate({ linea: g.grup_linea, codigo: g.grup_codigo })}
          deleteConfirmMessage="¿Eliminar este grupo?"
          tableClassName="w-full min-w-[500px] text-sm"
          columns={[
            { key: 'linea', header: 'Línea', headerClassName: 'hidden md:table-cell', cell: (g) => g.lin_desc ?? g.grup_linea, cellClassName: 'text-gray-500 hidden md:table-cell' },
            { key: 'codigo', header: 'Código', headerClassName: 'w-24', cell: (g) => g.grup_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
            { key: 'desc', header: 'Descripción', cell: (g) => g.grup_desc, cellClassName: 'font-medium text-gray-800' },
            { key: 'coef', header: 'Coeficiente', headerClassName: 'hidden md:table-cell text-right', cell: (g) => g.grup_coeficiente, cellClassName: 'text-gray-500 hidden md:table-cell text-right' },
          ]}
        />

        {pagination && (
          <TablePagination
            total={pagination.total}
            page={page}
            limit={limit}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nuevo' ? 'Nuevo grupo' : `Editar: ${(modal as Grupo).grup_desc}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          {modal === 'nuevo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Línea <span className="text-red-500">*</span></label>
              <select
                value={form.grup_linea}
                onChange={(e) => setForm({ ...form, grup_linea: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={0}>Seleccionar línea...</option>
                {lineas.map((l) => (
                  <option key={l.lin_codigo} value={l.lin_codigo}>{l.lin_desc}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input
              value={form.grup_desc}
              onChange={(e) => setForm({ ...form, grup_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coeficiente</label>
            <input
              type="number"
              step="0.01"
              value={form.grup_coeficiente}
              onChange={(e) => setForm({ ...form, grup_coeficiente: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </FormModal>
      )}
    </div>
  );
}
