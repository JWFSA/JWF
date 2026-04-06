'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getFacturas, deleteFactura } from '@/services/fac';
import { getMonedas } from '@/services/gen';
import { formatDate } from '@/lib/utils';
import type { Factura } from '@/types/fac';
import type { Moneda } from '@/types/gen';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { Filter, X } from 'lucide-react';

const fmt = (n: number | null | undefined) =>
  n != null ? Number(n).toLocaleString('es-PY') : '—';

const TIPO_LABEL: Record<number, string> = { 9: 'Contado', 10: 'Crédito', 16: 'Nota crédito' };

const COLUMNS = [
  { key: 'nro',    header: 'Nro.',    sortKey: 'nro',    headerClassName: 'w-32',                    cell: (r: Factura) => r.doc_nro_doc,                      cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',  header: 'Fecha',   sortKey: 'fecha',  headerClassName: 'w-28',                    cell: (r: Factura) => formatDate(r.doc_fec_doc),          cellClassName: 'text-xs text-gray-600' },
  { key: 'tipo',   header: 'Tipo',    sortKey: 'tipo',   headerClassName: 'w-28 hidden sm:table-cell',
    cell: (r: Factura) => {
      const tipo = Number(r.doc_tipo_mov);
      const label = TIPO_LABEL[tipo] ?? tipo;
      const color = tipo === 16 ? 'text-red-600' : 'text-gray-600';
      return <span className={color}>{label}</span>;
    },
    cellClassName: 'hidden sm:table-cell text-xs' },
  { key: 'cli',    header: 'Cliente', sortKey: 'cliente',                                             cell: (r: Factura) => r.cli_nom ?? r.doc_cli_nom ?? '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'timb',   header: 'Timbrado',                   headerClassName: 'hidden md:table-cell w-32', cell: (r: Factura) => r.doc_nro_timbrado ?? '—',        cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'total',  header: 'Total',   sortKey: 'total',  headerClassName: 'hidden md:table-cell w-36 text-right',
    cell: (r: Factura) => {
      const tipo = Number(r.doc_tipo_mov);
      const sign = tipo === 16 ? -1 : 1;
      const sum = Math.abs(Number(r.doc_grav_10_loc)) + Math.abs(Number(r.doc_grav_5_loc)) + Math.abs(Number(r.doc_neto_exen_loc)) + Math.abs(Number(r.doc_iva_10_loc)) + Math.abs(Number(r.doc_iva_5_loc));
      return <span className={tipo === 16 ? 'text-red-600' : ''}>{fmt(sign * sum)}</span>;
    },
    cellClassName: 'hidden md:table-cell text-xs text-right font-mono text-gray-700' },
  { key: 'obs',    header: 'Obs.',                       headerClassName: 'hidden lg:table-cell',    cell: (r: Factura) => r.doc_obs ?? '—',                  cellClassName: 'hidden lg:table-cell text-xs text-gray-400 truncate max-w-[160px]' },
];

export default function FacturasPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filtros avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [moneda, setMoneda] = useState('');
  const [soloConSaldo, setSoloConSaldo] = useState(false);
  const [tipoMov, setTipoMov] = useState('');
  const [nroDoc, setNroDoc] = useState('');

  const activeFilters = [fechaDesde, fechaHasta, moneda, soloConSaldo, tipoMov, nroDoc].filter(Boolean).length;

  const clearFilters = () => { setFechaDesde(''); setFechaHasta(''); setMoneda(''); setSoloConSaldo(false); setTipoMov(''); setNroDoc(''); setPage(1); };

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: monedasData } = useQuery({
    queryKey: ['monedas', { all: true }],
    queryFn: () => getMonedas(),
  });
  const monedas_list = monedasData ?? [];

  const queryParams: any = { page, limit, search: debouncedSearch, sortField, sortDir };
  if (fechaDesde) queryParams.fechaDesde = fechaDesde;
  if (fechaHasta) queryParams.fechaHasta = fechaHasta;
  if (moneda) queryParams.moneda = moneda;
  if (soloConSaldo) queryParams.soloConSaldo = 'true';
  if (tipoMov) queryParams.tipoMov = tipoMov;
  if (nroDoc) queryParams.nroDoc = nroDoc;

  const { data, isLoading } = useQuery({
    queryKey: ['facturas', queryParams],
    queryFn: () => getFacturas(queryParams),
  });

  const facturas = data?.data ?? [];
  const pagination = data?.pagination;
  const summary = (data as any)?.summary as { totalGrav10: number; totalGrav5: number; totalExenta: number; totalIva10: number; totalIva5: number; totalSaldo: number } | undefined;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteFactura,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['facturas'] }),
  });

  const exportParams: any = { all: true };
  if (fechaDesde) exportParams.fechaDesde = fechaDesde;
  if (fechaHasta) exportParams.fechaHasta = fechaHasta;
  if (moneda) exportParams.moneda = moneda;
  if (soloConSaldo) exportParams.soloConSaldo = 'true';
  if (tipoMov) exportParams.tipoMov = tipoMov;
  if (nroDoc) exportParams.nroDoc = nroDoc;

  const sel = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Facturas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Facturas de venta emitidas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-2 rounded-lg transition shrink-0 ${activeFilters > 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilters > 0 && <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters}</span>}
          </button>
          <ExportButton filename="facturas" fetchData={() => getFacturas(exportParams)} columns={[
            { header: 'Nro.', value: (r) => r.doc_nro_doc },
            { header: 'Fecha', value: (r) => r.doc_fec_doc },
            { header: 'Tipo', value: (r) => TIPO_LABEL[Number(r.doc_tipo_mov)] ?? r.doc_tipo_mov },
            { header: 'Cliente', value: (r) => r.cli_nom ?? r.doc_cli_nom },
            { header: 'Moneda', value: (r) => r.mon_desc },
            { header: 'Gravada 10%', value: (r) => { const s = Number(r.doc_tipo_mov) === 16 ? -1 : 1; return s * Math.abs(Number(r.doc_grav_10_loc)); } },
            { header: 'Gravada 5%', value: (r) => { const s = Number(r.doc_tipo_mov) === 16 ? -1 : 1; return s * Math.abs(Number(r.doc_grav_5_loc)); } },
            { header: 'Exenta', value: (r) => { const s = Number(r.doc_tipo_mov) === 16 ? -1 : 1; return s * Math.abs(Number(r.doc_neto_exen_loc)); } },
            { header: 'IVA 10%', value: (r) => { const s = Number(r.doc_tipo_mov) === 16 ? -1 : 1; return s * Math.abs(Number(r.doc_iva_10_loc)); } },
            { header: 'IVA 5%', value: (r) => { const s = Number(r.doc_tipo_mov) === 16 ? -1 : 1; return s * Math.abs(Number(r.doc_iva_5_loc)); } },
            { header: 'Total facturación', value: (r) => { const s = Number(r.doc_tipo_mov) === 16 ? -1 : 1; return s * (Math.abs(Number(r.doc_grav_10_loc)) + Math.abs(Number(r.doc_grav_5_loc)) + Math.abs(Number(r.doc_neto_exen_loc)) + Math.abs(Number(r.doc_iva_10_loc)) + Math.abs(Number(r.doc_iva_5_loc))); } },
          ]} />
          <PrimaryAddButton label="Nueva factura" shortLabel="Nueva" onClick={() => router.push('/fac/facturas/nuevo')} />
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Filtros avanzados</h3>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
                <X size={14} /> Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha desde</label>
              <input type="date" value={fechaDesde} onChange={(e) => { setFechaDesde(e.target.value); setPage(1); }} className={`w-full ${sel}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha hasta</label>
              <input type="date" value={fechaHasta} onChange={(e) => { setFechaHasta(e.target.value); setPage(1); }} className={`w-full ${sel}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
              <select value={tipoMov} onChange={(e) => { setTipoMov(e.target.value); setPage(1); }} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                <option value="9">Contado</option>
                <option value="10">Crédito</option>
                <option value="16">Nota crédito</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nro. comprobante</label>
              <input value={nroDoc} onChange={(e) => { setNroDoc(e.target.value); setPage(1); }} placeholder="Ej: 10010002773" className={`w-full ${sel}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Moneda</label>
              <select value={moneda} onChange={(e) => { setMoneda(e.target.value); setPage(1); }} className={`w-full ${sel}`}>
                <option value="">Todas</option>
                {monedas_list.map((m: Moneda) => <option key={m.mon_codigo} value={m.mon_codigo}>{m.mon_desc}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={soloConSaldo} onChange={(e) => { setSoloConSaldo(e.target.checked); setPage(1); }}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                <span className="text-sm text-gray-700">Solo con saldo</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de totales */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {[
            { label: 'Gravada 10%', value: summary.totalGrav10 },
            { label: 'Gravada 5%', value: summary.totalGrav5 },
            { label: 'Exenta', value: summary.totalExenta },
            { label: 'IVA 10%', value: summary.totalIva10 },
            { label: 'IVA 5%', value: summary.totalIva5 },
            { label: 'Total facturación', value: summary.totalGrav10 + summary.totalGrav5 + summary.totalExenta + summary.totalIva10 + summary.totalIva5 },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
              <p className="text-xs font-medium text-gray-500 truncate">{item.label}</p>
              <p className="text-sm font-semibold text-gray-800 tabular-nums mt-0.5">{fmt(item.value)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por cliente, nro. o timbrado..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={facturas}
          getRowKey={(r) => r.doc_clave}
          onEdit={(r) => router.push(`/fac/facturas/${r.doc_clave}`)}
          onDelete={(r) => deleteMut.mutate(r.doc_clave)}
          deleteConfirmMessage="¿Eliminar esta factura?"
          tableClassName="w-full text-sm min-w-[500px]"
          sortField={sortField}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          columns={COLUMNS}
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
    </div>
  );
}
