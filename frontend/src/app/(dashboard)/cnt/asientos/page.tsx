'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAsientos, deleteAsiento, getEjercicios } from '@/services/cnt';
import { formatDate } from '@/lib/utils';
import type { Asiento } from '@/types/cnt';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { Filter, X } from 'lucide-react';

const COLUMNS = [
  { key: 'nro',       header: 'Nro.',       sortKey: 'nro',       headerClassName: 'w-20',                   cell: (r: Asiento) => r.asi_nro,                 cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',     header: 'Fecha',      sortKey: 'fecha',     headerClassName: 'w-28',                   cell: (r: Asiento) => formatDate(r.asi_fec),     cellClassName: 'text-xs text-gray-600' },
  { key: 'obs',       header: 'Observación',                                                                 cell: (r: Asiento) => r.asi_obs ?? '—',          cellClassName: 'font-medium text-gray-800 truncate max-w-xs' },
  { key: 'ejercicio', header: 'Ejercicio',  sortKey: 'ejercicio', headerClassName: 'hidden sm:table-cell w-20', cell: (r: Asiento) => r.asi_ejercicio,         cellClassName: 'hidden sm:table-cell text-xs text-gray-500 text-center' },
  { key: 'login',     header: 'Usuario',                          headerClassName: 'hidden md:table-cell w-24', cell: (r: Asiento) => r.asi_login ?? '—',      cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
];

export default function AsientosPage() {
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
  const [ejercicio, setEjercicio] = useState('');

  const activeFilters = [fechaDesde, fechaHasta, ejercicio].filter(Boolean).length;
  const clearFilters = () => { setFechaDesde(''); setFechaHasta(''); setEjercicio(''); setPage(1); };

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data: ejData } = useQuery({ queryKey: ['cnt-ejercicios', { all: true }], queryFn: () => getEjercicios({ all: true }) });
  const ejercicios = ejData?.data ?? [];

  const queryParams: any = { page, limit, search: debouncedSearch, sortField, sortDir };
  if (fechaDesde) queryParams.fechaDesde = fechaDesde;
  if (fechaHasta) queryParams.fechaHasta = fechaHasta;
  if (ejercicio) queryParams.ejercicio = ejercicio;

  const { data, isLoading } = useQuery({
    queryKey: ['cnt-asientos', queryParams],
    queryFn: () => getAsientos(queryParams),
  });

  const asientos   = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteMut = useMutation({ mutationFn: deleteAsiento, onSuccess: () => qc.invalidateQueries({ queryKey: ['cnt-asientos'] }) });

  const exportParams: any = { all: true };
  if (fechaDesde) exportParams.fechaDesde = fechaDesde;
  if (fechaHasta) exportParams.fechaHasta = fechaHasta;
  if (ejercicio) exportParams.ejercicio = ejercicio;

  const sel = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Asientos contables</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registros contables del libro diario</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-2 rounded-lg transition shrink-0 ${activeFilters > 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilters > 0 && <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters}</span>}
          </button>
          <ExportButton filename="asientos-contables" fetchData={() => getAsientos(exportParams)} columns={[
            { header: 'Nro.', value: (r) => r.asi_nro },
            { header: 'Fecha', value: (r) => r.asi_fec },
            { header: 'Observación', value: (r) => r.asi_obs },
            { header: 'Ejercicio', value: (r) => r.asi_ejercicio },
            { header: 'Usuario', value: (r) => r.asi_login },
          ]} />
          <PrimaryAddButton label="Nuevo asiento" shortLabel="Nuevo" onClick={() => router.push('/cnt/asientos/nuevo')} />
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Ejercicio</label>
              <select value={ejercicio} onChange={(e) => { setEjercicio(e.target.value); setPage(1); }} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                {ejercicios.map((ej: any) => <option key={ej.ej_codigo} value={ej.ej_codigo}>Ej. {ej.ej_codigo} ({String(ej.ej_fec_inicial).substring(0,4)})</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nro u observación..." />
        </div>
        <DataTable isLoading={isLoading} rows={asientos} getRowKey={(r) => r.asi_clave} columns={COLUMNS}
          onEdit={(r) => router.push(`/cnt/asientos/${r.asi_clave}`)}
          onDelete={(r) => deleteMut.mutate(r.asi_clave)}
          deleteConfirmMessage="¿Eliminar este asiento?"
          tableClassName="w-full text-sm min-w-[500px]"
          sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && (
          <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
        )}
      </div>
    </div>
  );
}
