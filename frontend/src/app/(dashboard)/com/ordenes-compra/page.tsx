'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getOrdenesCompra, deleteOrdenCompra } from '@/services/com';
import { formatDate } from '@/lib/utils';
import type { OrdenCompra } from '@/types/com';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { Filter, X } from 'lucide-react';

const ESTADOS: Record<string, string> = { PE: 'Pendiente', AU: 'Autorizada', AN: 'Anulada' };
const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

const COLUMNS = [
  { key: 'nro',    header: 'Nro.',       sortKey: 'nro',    headerClassName: 'w-20',                   cell: (r: OrdenCompra) => r.orcom_nro,                              cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',  header: 'Fecha',      sortKey: 'fecha',  headerClassName: 'w-28',                   cell: (r: OrdenCompra) => formatDate(r.orcom_fec_emis),             cellClassName: 'text-xs text-gray-600' },
  { key: 'prov',   header: 'Proveedor',  sortKey: 'prov',                                              cell: (r: OrdenCompra) => r.prov_nom ?? '—',                        cellClassName: 'font-medium text-gray-800' },
  { key: 'mon',    header: 'Moneda',                         headerClassName: 'hidden sm:table-cell w-20', cell: (r: OrdenCompra) => r.mon_desc ?? '—',                     cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'total',  header: 'Total',      sortKey: 'total',  headerClassName: 'hidden md:table-cell w-32 text-right', cell: (r: OrdenCompra) => fmt(r.orcom_total),           cellClassName: 'hidden md:table-cell text-right tabular-nums text-gray-700' },
  { key: 'estado', header: 'Estado',     sortKey: 'estado', headerClassName: 'hidden sm:table-cell w-28', cell: (r: OrdenCompra) => ESTADOS[r.orcom_estado ?? ''] ?? r.orcom_estado ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
];

export default function OrdenesCompraPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [showFilters, setShowFilters] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [estado, setEstado] = useState('');

  const activeFilters = [fechaDesde, fechaHasta, estado].filter(Boolean).length;
  const clearFilters = () => { setFechaDesde(''); setFechaHasta(''); setEstado(''); setPage(1); };

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const queryParams: any = { page, limit, search: debouncedSearch, sortField, sortDir };
  if (fechaDesde) queryParams.fechaDesde = fechaDesde;
  if (fechaHasta) queryParams.fechaHasta = fechaHasta;
  if (estado) queryParams.estado = estado;

  const { data, isLoading } = useQuery({
    queryKey: ['ordenes-compra', queryParams],
    queryFn: () => getOrdenesCompra(queryParams),
  });

  const ordenes    = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteMut = useMutation({ mutationFn: deleteOrdenCompra, onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes-compra'] }) });

  const exportParams: any = { all: true };
  if (fechaDesde) exportParams.fechaDesde = fechaDesde;
  if (fechaHasta) exportParams.fechaHasta = fechaHasta;
  if (estado) exportParams.estado = estado;

  const sel = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Órdenes de compra</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de órdenes de compra a proveedores</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-2 rounded-lg transition shrink-0 ${activeFilters > 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilters > 0 && <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters}</span>}
          </button>
          <ExportButton filename="ordenes-compra" fetchData={() => getOrdenesCompra(exportParams)} columns={[
            { header: 'Nro.', value: (r) => r.orcom_nro },
            { header: 'Fecha', value: (r) => r.orcom_fec_emis },
            { header: 'Proveedor', value: (r) => r.prov_nom },
            { header: 'Moneda', value: (r) => r.mon_desc },
            { header: 'Total', value: (r) => r.orcom_total },
            { header: 'Estado', value: (r) => r.orcom_estado },
            { header: 'Forma pago', value: (r) => r.orcom_forma_pago },
          ]} />
          <PrimaryAddButton label="Nueva orden" shortLabel="Nueva" onClick={() => router.push('/com/ordenes-compra/nuevo')} />
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Filtros avanzados</h3>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"><X size={14} /> Limpiar</button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha desde</label>
              <input type="date" value={fechaDesde} onChange={(e) => { setFechaDesde(e.target.value); setPage(1); }} className={`w-full ${sel}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha hasta</label>
              <input type="date" value={fechaHasta} onChange={(e) => { setFechaHasta(e.target.value); setPage(1); }} className={`w-full ${sel}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
              <select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1); }} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                <option value="PE">Pendiente</option>
                <option value="AU">Autorizada</option>
                <option value="AN">Anulada</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nro, proveedor u observación..." />
        </div>
        <DataTable isLoading={isLoading} rows={ordenes} getRowKey={(r) => r.orcom_nro}
          onEdit={(r) => router.push(`/com/ordenes-compra/${r.orcom_nro}`)}
          onDelete={(r) => deleteMut.mutate(r.orcom_nro)}
          deleteConfirmMessage="¿Eliminar esta orden de compra?"
          tableClassName="w-full text-sm min-w-[500px]"
          sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }}
          columns={COLUMNS} />
        {pagination && (
          <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
        )}
      </div>
    </div>
  );
}
