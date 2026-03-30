'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getDocumentosFin } from '@/services/fin';
import { formatDate } from '@/lib/utils';
import type { DocumentoFin } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { Filter, X } from 'lucide-react';

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

const COLUMNS = [
  { key: 'nro',    header: 'Nro. doc.',    sortKey: 'nro',   headerClassName: 'w-32',                   cell: (r: DocumentoFin) => r.doc_nro_doc,                         cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'tipo',   header: 'Tipo',         sortKey: 'tipo',  headerClassName: 'hidden lg:table-cell w-40', cell: (r: DocumentoFin) => r.tmov_desc ?? '—',                  cellClassName: 'hidden lg:table-cell text-xs text-gray-500 truncate max-w-[160px]' },
  { key: 'fecha',  header: 'Fecha',        sortKey: 'fecha', headerClassName: 'w-24',                   cell: (r: DocumentoFin) => formatDate(r.doc_fec_doc),              cellClassName: 'text-xs text-gray-600' },
  { key: 'prov',   header: 'Proveedor/Cliente', sortKey: 'prov',                                        cell: (r: DocumentoFin) => r.prov_nom ?? r.doc_cli_nom ?? '—',     cellClassName: 'font-medium text-gray-800 truncate max-w-[200px]' },
  { key: 'mon',    header: 'Mon.',                            headerClassName: 'hidden sm:table-cell w-16', cell: (r: DocumentoFin) => r.mon_desc ?? '—',                   cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'saldo',  header: 'Saldo',        sortKey: 'total', headerClassName: 'hidden md:table-cell w-32 text-right', cell: (r: DocumentoFin) => fmt(r.doc_saldo_mon),      cellClassName: 'hidden md:table-cell text-right tabular-nums text-gray-700' },
  { key: 'ts',     header: 'D/C',                             headerClassName: 'hidden sm:table-cell w-12', cell: (r: DocumentoFin) => r.doc_tipo_saldo ?? '—',             cellClassName: 'hidden sm:table-cell text-xs text-center text-gray-500' },
];

const TIPOS_MOV = [
  { value: '1', label: 'Fact. contado rec.' },
  { value: '2', label: 'Fact. crédito rec.' },
  { value: '10', label: 'Fact. crédito emit.' },
  { value: '6', label: 'Recibo cobro emit.' },
  { value: '19', label: 'Orden de pago' },
  { value: '12', label: 'Depósito bancario' },
  { value: '13', label: 'Extracción bancaria' },
  { value: '14', label: 'Nota crédito rec.' },
  { value: '16', label: 'Nota crédito emit.' },
  { value: '22', label: 'Retención rec.' },
  { value: '25', label: 'Mov. varios débito' },
  { value: '26', label: 'Mov. varios crédito' },
  { value: '31', label: 'Adelanto proveedor' },
  { value: '43', label: 'Fact. créd. rec. ajuste' },
];

export default function DocumentosFinPage() {
  const router = useRouter();
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
  const [tipoMov, setTipoMov] = useState('');
  const [tipoSaldo, setTipoSaldo] = useState('');
  const [soloConSaldo, setSoloConSaldo] = useState(false);

  const activeFilters = [fechaDesde, fechaHasta, tipoMov, tipoSaldo, soloConSaldo].filter(Boolean).length;

  const clearFilters = () => { setFechaDesde(''); setFechaHasta(''); setTipoMov(''); setTipoSaldo(''); setSoloConSaldo(false); setPage(1); };

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const queryParams: any = { page, limit, search: debouncedSearch, sortField, sortDir };
  if (fechaDesde) queryParams.fechaDesde = fechaDesde;
  if (fechaHasta) queryParams.fechaHasta = fechaHasta;
  if (tipoMov) queryParams.tipoMov = tipoMov;
  if (tipoSaldo) queryParams.tipoSaldo = tipoSaldo;
  if (soloConSaldo) queryParams.soloConSaldo = 'true';

  const { data, isLoading } = useQuery({
    queryKey: ['fin-documentos', queryParams],
    queryFn: () => getDocumentosFin(queryParams),
  });

  const docs       = data?.data ?? [];
  const pagination = data?.pagination;

  const exportParams: any = { all: true };
  if (fechaDesde) exportParams.fechaDesde = fechaDesde;
  if (fechaHasta) exportParams.fechaHasta = fechaHasta;
  if (tipoMov) exportParams.tipoMov = tipoMov;
  if (tipoSaldo) exportParams.tipoSaldo = tipoSaldo;
  if (soloConSaldo) exportParams.soloConSaldo = 'true';

  const sel = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Documentos financieros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Facturas, notas de crédito, recibos y otros documentos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-2 rounded-lg transition shrink-0 ${activeFilters > 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilters > 0 && <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters}</span>}
          </button>
          <ExportButton filename="documentos-financieros" fetchData={() => getDocumentosFin(exportParams)} columns={[
            { header: 'Nro. documento', value: (r) => r.doc_nro_doc },
            { header: 'Tipo', value: (r) => r.tmov_desc },
            { header: 'Fecha', value: (r) => r.doc_fec_doc },
            { header: 'Proveedor/Cliente', value: (r) => r.prov_nom ?? r.doc_cli_nom },
            { header: 'Moneda', value: (r) => r.mon_desc },
            { header: 'Exenta', value: (r) => r.doc_neto_exen_mon },
            { header: 'Gravada', value: (r) => r.doc_neto_grav_mon },
            { header: 'IVA', value: (r) => r.doc_iva_mon },
            { header: 'Saldo', value: (r) => r.doc_saldo_mon },
            { header: 'D/C', value: (r) => r.doc_tipo_saldo },
            { header: 'Observación', value: (r) => r.doc_obs },
          ]} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha desde</label>
              <input type="date" value={fechaDesde} onChange={(e) => { setFechaDesde(e.target.value); setPage(1); }} className={`w-full ${sel}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha hasta</label>
              <input type="date" value={fechaHasta} onChange={(e) => { setFechaHasta(e.target.value); setPage(1); }} className={`w-full ${sel}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de movimiento</label>
              <select value={tipoMov} onChange={(e) => { setTipoMov(e.target.value); setPage(1); }} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                {TIPOS_MOV.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo saldo</label>
              <select value={tipoSaldo} onChange={(e) => { setTipoSaldo(e.target.value); setPage(1); }} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                <option value="D">Débito</option>
                <option value="C">Crédito</option>
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nro, proveedor, cliente u observación..." />
        </div>
        <DataTable
          isLoading={isLoading} rows={docs} getRowKey={(r) => r.doc_clave} columns={COLUMNS}
          onEdit={(r) => router.push(`/fin/documentos/${r.doc_clave}`)}
          tableClassName="w-full text-sm min-w-[500px]"
          sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }}
        />
        {pagination && (
          <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
        )}
      </div>
    </div>
  );
}
