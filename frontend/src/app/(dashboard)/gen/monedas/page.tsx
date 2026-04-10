'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMonedas, createMoneda, updateMoneda, deleteMoneda } from '@/services/gen';
import type { Moneda } from '@/types/gen';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import DataTable from '@/components/ui/DataTable';

const empty = { mon_desc: '', mon_simbolo: '', mon_tasa_comp: 0, mon_tasa_vta: 0 };

const fmtTasa = (n?: number | null) =>
  n != null ? Number(n).toLocaleString('es-PY', { minimumFractionDigits: 0, maximumFractionDigits: 4 }) : '—';

const COLUMNS = [
  { key: 'codigo',    header: 'Código',      sortKey: 'codigo',    headerClassName: 'w-24', cell: (m: Moneda) => m.mon_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',      header: 'Descripción', sortKey: 'desc',      cell: (m: Moneda) => m.mon_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'simbolo',   header: 'Símbolo',     sortKey: 'simbolo',   headerClassName: 'w-16', cell: (m: Moneda) => m.mon_simbolo, cellClassName: 'text-gray-500' },
  { key: 'tasa_comp', header: 'Tasa compra', sortKey: 'tasa_comp', headerClassName: 'text-right hidden md:table-cell', cell: (m: Moneda) => fmtTasa(m.mon_tasa_comp), cellClassName: 'text-right tabular-nums text-gray-600 hidden md:table-cell' },
  { key: 'tasa_vta',  header: 'Tasa venta',  sortKey: 'tasa_vta',  headerClassName: 'text-right hidden md:table-cell', cell: (m: Moneda) => fmtTasa(m.mon_tasa_vta), cellClassName: 'text-right tabular-nums text-gray-600 hidden md:table-cell' },
];

function sortMonedas(list: Moneda[], field: string, dir: 'asc' | 'desc'): Moneda[] {
  if (!field) return list;
  return [...list].sort((a, b) => {
    let va: any, vb: any;
    if (field === 'codigo')         { va = a.mon_codigo;    vb = b.mon_codigo; }
    else if (field === 'desc')      { va = a.mon_desc;      vb = b.mon_desc; }
    else if (field === 'simbolo')   { va = a.mon_simbolo;   vb = b.mon_simbolo; }
    else if (field === 'tasa_comp') { va = a.mon_tasa_comp; vb = b.mon_tasa_comp; }
    else                            { va = a.mon_tasa_vta;  vb = b.mon_tasa_vta; }
    if (va == null) return 1; if (vb == null) return -1;
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return dir === 'desc' ? -cmp : cmp;
  });
}

export default function MonedasPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'nueva' | Moneda>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('codigo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: monedasRaw = [], isLoading } = useQuery({ queryKey: ['monedas'], queryFn: getMonedas });

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const list = q
      ? monedasRaw.filter((m) => `${m.mon_codigo} ${m.mon_desc} ${m.mon_simbolo ?? ''}`.toLowerCase().includes(q))
      : monedasRaw;
    return sortMonedas(list, sortField, sortDir);
  }, [monedasRaw, debouncedSearch, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const monedas = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, safePage, limit]);

  const inv = () => qc.invalidateQueries({ queryKey: ['monedas'] });
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const openNueva  = () => { setForm(empty); setError(''); setModal('nueva'); };
  const openEditar = (m: Moneda) => { setForm({ mon_desc: m.mon_desc, mon_simbolo: m.mon_simbolo ?? '', mon_tasa_comp: m.mon_tasa_comp ?? 0, mon_tasa_vta: m.mon_tasa_vta ?? 0 }); setError(''); setModal(m); };

  const createMut = useMutation({ mutationFn: createMoneda, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateMoneda(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteMoneda, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.mon_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nueva' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Moneda).mon_codigo, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Monedas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monedas y tasas de cambio</p>
        </div>
        <PrimaryAddButton label="Nueva moneda" shortLabel="Nueva" onClick={openNueva} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar moneda..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={monedas}
          getRowKey={(m) => m.mon_codigo}
          onEdit={openEditar}
          onDelete={(m) => deleteMut.mutate(m.mon_codigo)}
          deleteConfirmMessage="¿Eliminar esta moneda?"
          tableClassName="w-full min-w-[560px] text-sm"
          emptyLabel="Sin registros"
          columns={COLUMNS}
          sortField={sortField}
          sortDir={sortDir}
          onSortChange={handleSortChange}
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
          title={modal === 'nueva' ? 'Nueva moneda' : `Editar: ${(modal as Moneda).mon_desc}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.mon_desc} onChange={(e) => setForm({ ...form, mon_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Símbolo</label>
            <input value={form.mon_simbolo} onChange={(e) => setForm({ ...form, mon_simbolo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: $, Gs, USD" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa compra</label>
              <input type="number" value={form.mon_tasa_comp} onChange={(e) => setForm({ ...form, mon_tasa_comp: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa venta</label>
              <input type="number" value={form.mon_tasa_vta} onChange={(e) => setForm({ ...form, mon_tasa_vta: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
