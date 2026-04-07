'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getPresupuestos, deletePresupuesto, convertirPresupuesto, copiarPresupuesto, getVendedores } from '@/services/fac';
import { formatDate } from '@/lib/utils';
import type { Pedido } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { useFilters } from '@/stores/useFilterStore';
import { ArrowRightLeft, Copy, Filter, X } from 'lucide-react';

const ESTADO: Record<string, { label: string; cls: string }> = {
  P: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-700' },
  A: { label: 'Aprobado',  cls: 'bg-green-100 text-green-700'  },
  C: { label: 'Cerrado',   cls: 'bg-gray-100 text-gray-500'   },
};

const fmtTotal = (n?: number) =>
  n != null ? new Intl.NumberFormat('es-PY').format(Number(n)) : '\u2014';

const COLUMNS = [
  { key: 'nro',    header: 'Nro.',     sortKey: 'nro',     headerClassName: 'w-28', cell: (p: Pedido) => p.ped_nro, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',  header: 'Fecha',    sortKey: 'fecha',   headerClassName: 'w-36', cell: (p: Pedido) => formatDate(p.ped_fecha), cellClassName: 'text-gray-600' },
  { key: 'cli',    header: 'Cliente',  sortKey: 'cliente', cell: (p: Pedido) => p.cli_nom ?? '\u2014', cellClassName: 'font-medium text-gray-800' },
  { key: 'vend',   header: 'Vendedor', headerClassName: 'hidden md:table-cell',
    cell: (p: Pedido) => p.vend_nombre ? `${p.vend_nombre} ${p.vend_apellido ?? ''}`.trim() : '\u2014',
    cellClassName: 'text-gray-500 hidden md:table-cell' },
  { key: 'total',  header: 'Total',    sortKey: 'total',   headerClassName: 'hidden sm:table-cell text-right',
    cell: (p: Pedido) => fmtTotal(p.ped_imp_total_mon),
    cellClassName: 'text-right tabular-nums text-gray-700 hidden sm:table-cell' },
  { key: 'estado', header: 'Estado',   sortKey: 'estado',
    cell: (p: Pedido) => {
      const e = ESTADO[p.ped_estado] ?? { label: p.ped_estado, cls: 'bg-gray-100 text-gray-500' };
      return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${e.cls}`}>{e.label}</span>;
    } },
];

const PAGE_ID = 'presupuestos';
const DEFAULTS = { fechaDesde: '', fechaHasta: '', estado: '', vendedor: '', search: '' };

export default function PresupuestosPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filters, setFilter, clearFilters] = useFilters(PAGE_ID, DEFAULTS);
  const sf = (key: keyof typeof DEFAULTS, value: string) => { setFilter(key, value); setPage(1); };

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const activeFilters = [filters.fechaDesde, filters.fechaHasta, filters.estado, filters.vendedor].filter(Boolean).length;
  const [showFilters, setShowFilters] = useState(activeFilters > 0);

  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => {
    const t = setTimeout(() => sf('search', searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: vendData } = useQuery({ queryKey: ['vendedores', { all: true }], queryFn: () => getVendedores({ all: true }) });
  const vendedores = vendData?.data ?? [];

  const queryParams: Record<string, unknown> = { page, limit, search: filters.search, sortField, sortDir };
  if (filters.fechaDesde) queryParams.fechaDesde = filters.fechaDesde;
  if (filters.fechaHasta) queryParams.fechaHasta = filters.fechaHasta;
  if (filters.estado)     queryParams.estado = filters.estado;
  if (filters.vendedor)   queryParams.vendedor = filters.vendedor;

  const { data, isLoading } = useQuery({
    queryKey: ['presupuestos', queryParams],
    queryFn: () => getPresupuestos(queryParams),
  });

  const presupuestos = data?.data ?? [];
  const pagination   = data?.pagination;

  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deletePresupuesto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presupuestos'] }),
  });

  const convertirMut = useMutation({
    mutationFn: convertirPresupuesto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuestos'] });
      qc.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  const copiarMut = useMutation({
    mutationFn: copiarPresupuesto,
    onSuccess: (nuevo) => {
      qc.invalidateQueries({ queryKey: ['presupuestos'] });
      router.push(`/fac/presupuestos/${nuevo.ped_clave}`);
    },
  });

  const exportParams: Record<string, unknown> = { all: true };
  if (filters.fechaDesde) exportParams.fechaDesde = filters.fechaDesde;
  if (filters.fechaHasta) exportParams.fechaHasta = filters.fechaHasta;
  if (filters.estado)     exportParams.estado = filters.estado;
  if (filters.vendedor)   exportParams.vendedor = filters.vendedor;

  const sel = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Presupuestos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cotizaciones y propuestas de venta</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-2 rounded-lg transition shrink-0 ${activeFilters > 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilters > 0 && <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters}</span>}
          </button>
          <ExportButton filename="presupuestos" fetchData={() => getPresupuestos(exportParams)} columns={[
            { header: 'Nro.', value: (r) => r.ped_nro },
            { header: 'Fecha', value: (r) => r.ped_fecha },
            { header: 'Cliente', value: (r) => r.cli_nom },
            { header: 'Vendedor', value: (r) => r.vend_nombre ? `${r.vend_nombre} ${r.vend_apellido ?? ''}`.trim() : '' },
            { header: 'Estado', value: (r) => ESTADO[r.ped_estado]?.label ?? r.ped_estado },
            { header: 'Total', value: (r) => r.ped_imp_total_mon },
          ]} />
          <PrimaryAddButton label="Nuevo presupuesto" shortLabel="Nuevo" href="/fac/presupuestos/nuevo" />
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Filtros avanzados</h3>
            {activeFilters > 0 && (
              <button onClick={() => { clearFilters(); setSearchInput(''); }} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
                <X size={14} /> Limpiar filtros
              </button>
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
              <select value={filters.estado} onChange={(e) => sf('estado', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                <option value="P">Pendiente</option>
                <option value="A">Aprobado</option>
                <option value="C">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Vendedor</label>
              <select value={filters.vendedor} onChange={(e) => sf('vendedor', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                {vendedores.map((v) => (
                  <option key={v.vend_legajo} value={v.vend_legajo}>{v.oper_nombre} {v.oper_apellido}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={searchInput} onChange={setSearchInput} placeholder="Buscar por cliente, nro. o producto..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={presupuestos}
          getRowKey={(p) => p.ped_clave}
          onEdit={(p) => router.push(`/fac/presupuestos/${p.ped_clave}`)}
          onDelete={(p) => deleteMut.mutate(p.ped_clave)}
          deleteConfirmMessage="\u00BFEliminar este presupuesto?"
          tableClassName="w-full min-w-[700px] text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
          extraActions={(p) => (
            <>
              <button
                type="button"
                title="Copiar presupuesto"
                onClick={() => { if (confirm('\u00BFCopiar este presupuesto?')) copiarMut.mutate(p.ped_clave); }}
                className="p-1 text-gray-400 hover:text-primary-600 rounded transition"
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                title="Convertir a pedido"
                onClick={() => {
                  if (confirm('\u00BFConvertir este presupuesto en pedido de venta?')) {
                    convertirMut.mutate(p.ped_clave);
                  }
                }}
                className="p-1 text-gray-400 hover:text-orange-600 rounded transition"
              >
                <ArrowRightLeft size={14} />
              </button>
            </>
          )}
        />

        {pagination && (
          <TablePagination
            total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
}
