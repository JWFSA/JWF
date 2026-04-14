'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getOrdenesTrabajoList, deleteOrdenTrabajo, getTiposOT } from '@/services/prd';
import { formatDate } from '@/lib/utils';
import type { OrdenTrabajo } from '@/types/prd';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { useFilters } from '@/stores/useFilterStore';
import { Filter, X } from 'lucide-react';

const SIT: Record<number, { label: string; cls: string }> = {
  0: { label: 'Ingresada',   cls: 'bg-gray-100 text-gray-600' },
  1: { label: 'Abierta',     cls: 'bg-blue-100 text-blue-700' },
  2: { label: 'En proceso',  cls: 'bg-yellow-100 text-yellow-700' },
  3: { label: 'Terminada',   cls: 'bg-green-100 text-green-700' },
  4: { label: 'Facturada',   cls: 'bg-purple-100 text-purple-700' },
};

const fmt = (n?: number | null) => n != null ? new Intl.NumberFormat('es-PY').format(Number(n)) : '\u2014';

const COLUMNS = [
  { key: 'nro',    header: 'Nro.',     sortKey: 'nro',     headerClassName: 'w-24', cell: (r: OrdenTrabajo) => r.ot_nro, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',  header: 'Fecha',    sortKey: 'fecha',   headerClassName: 'w-28', cell: (r: OrdenTrabajo) => formatDate(r.ot_fec_emis), cellClassName: 'text-gray-600' },
  { key: 'tipo',   header: 'Tipo',     sortKey: 'tipo',    headerClassName: 'w-28 hidden sm:table-cell', cell: (r: OrdenTrabajo) => r.tipo_desc ?? '\u2014', cellClassName: 'text-xs text-gray-500 hidden sm:table-cell' },
  { key: 'cli',    header: 'Cliente',  sortKey: 'cliente', cell: (r: OrdenTrabajo) => r.ot_cli_nom ?? '\u2014', cellClassName: 'font-medium text-gray-800' },
  { key: 'prod',   header: 'Producto', headerClassName: 'hidden md:table-cell', cell: (r: OrdenTrabajo) => r.ot_nom_producto ?? r.ot_desc ?? '\u2014', cellClassName: 'text-xs text-gray-500 hidden md:table-cell truncate max-w-[200px]' },
  { key: 'costo',  header: 'Costo',    headerClassName: 'hidden lg:table-cell w-28 text-right', cell: (r: OrdenTrabajo) => fmt(r.ot_costo_mon), cellClassName: 'hidden lg:table-cell text-right tabular-nums text-xs text-gray-700' },
  { key: 'sit',    header: 'Situaci\u00f3n', sortKey: 'situacion',
    cell: (r: OrdenTrabajo) => {
      const s = SIT[Number(r.ot_situacion)] ?? { label: String(r.ot_situacion ?? '\u2014'), cls: 'bg-gray-100 text-gray-500' };
      return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>;
    } },
];

const PAGE_ID = 'ordenes-trabajo';
const DEFAULTS = { fechaDesde: '', fechaHasta: '', tipo: '', situacion: '', search: '' };

export default function OrdenesTrabajoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filters, setFilter, clearFilters] = useFilters(PAGE_ID, DEFAULTS);
  const sf = (key: keyof typeof DEFAULTS, value: string) => { setFilter(key, value); setPage(1); };

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('nro');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const activeFilters = [filters.fechaDesde, filters.fechaHasta, filters.tipo, filters.situacion].filter(Boolean).length;
  const [showFilters, setShowFilters] = useState(activeFilters > 0);

  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => { const t = setTimeout(() => sf('search', searchInput), 400); return () => clearTimeout(t); }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: tiposData } = useQuery({ queryKey: ['tipos-ot'], queryFn: getTiposOT });
  const tipos = tiposData ?? [];

  const queryParams: Record<string, unknown> = { page, limit, search: filters.search, sortField, sortDir };
  if (filters.fechaDesde) queryParams.fechaDesde = filters.fechaDesde;
  if (filters.fechaHasta) queryParams.fechaHasta = filters.fechaHasta;
  if (filters.tipo)       queryParams.tipo = filters.tipo;
  if (filters.situacion)  queryParams.situacion = filters.situacion;

  const { data, isLoading } = useQuery({
    queryKey: ['ordenes-trabajo', queryParams],
    queryFn: () => getOrdenesTrabajoList(queryParams),
  });

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteOrdenTrabajo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes-trabajo'] }),
  });

  const sel = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{'\u00D3'}rdenes de trabajo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gesti{'\u00f3'}n de {'\u00f3'}rdenes de trabajo y producci{'\u00f3'}n</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-2 rounded-lg transition shrink-0 ${activeFilters > 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilters > 0 && <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters}</span>}
          </button>
          <ExportButton filename="ordenes-trabajo" fetchData={() => getOrdenesTrabajoList({ all: true, ...queryParams })} columns={[
            { header: 'Nro.', value: (r) => r.ot_nro },
            { header: 'Fecha', value: (r) => r.ot_fec_emis },
            { header: 'Tipo', value: (r) => r.tipo_desc },
            { header: 'Cliente', value: (r) => r.ot_cli_nom },
            { header: 'Producto', value: (r) => r.ot_nom_producto },
            { header: 'Situaci\u00f3n', value: (r) => SIT[Number(r.ot_situacion)]?.label ?? r.ot_situacion },
          ]} />
          <PrimaryAddButton label="Nueva OT" shortLabel="Nueva" href="/prd/ordenes-trabajo/nuevo" />
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Filtros avanzados</h3>
            {activeFilters > 0 && (
              <button onClick={() => { clearFilters(); setSearchInput(''); }} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"><X size={14} /> Limpiar</button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha desde</label>
              <input type="date" value={filters.fechaDesde} onChange={(e) => sf('fechaDesde', e.target.value)} className={`w-full ${sel}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha hasta</label>
              <input type="date" value={filters.fechaHasta} onChange={(e) => sf('fechaHasta', e.target.value)} className={`w-full ${sel}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
              <select value={filters.tipo} onChange={(e) => sf('tipo', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                {tipos.map((t) => <option key={t.tipo_codigo} value={t.tipo_codigo}>{t.tipo_desc}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Situaci{'\u00f3'}n</label>
              <select value={filters.situacion} onChange={(e) => sf('situacion', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todas</option>
                {Object.entries(SIT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={searchInput} onChange={setSearchInput} placeholder="Buscar por nro, cliente o producto..." />
        </div>
        <DataTable isLoading={isLoading} rows={rows} getRowKey={(r) => r.ot_clave}
          onEdit={(r) => router.push(`/prd/ordenes-trabajo/${r.ot_clave}`)}
          onDelete={(r) => deleteMut.mutate(r.ot_clave)}
          deleteConfirmMessage={'\u00BFEliminar esta OT?'}
          tableClassName="w-full min-w-[700px] text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
