'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOcupaciones, getUbicaciones } from '@/services/stk';
import { formatDate } from '@/lib/utils';
import type { OcupacionEspacio } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { useFilters } from '@/stores/useFilterStore';

const fmt = (n?: number | null) => n != null ? Number(n).toLocaleString('es-PY') : '—';

const ESTADO: Record<string, { label: string; cls: string }> = {
  A: { label: 'Activo', cls: 'bg-green-100 text-green-700' },
  I: { label: 'Inactivo', cls: 'bg-gray-100 text-gray-500' },
};

const COLUMNS = [
  { key: 'art', header: 'Espacio / Artículo', sortKey: 'articulo',
    cell: (r: OcupacionEspacio) => (
      <div>
        <div className="font-medium text-gray-800 text-xs">{r.art_desc}</div>
        {r.res_grupo_desc && <div className="text-gray-400 text-xs">{r.res_grupo_desc}</div>}
      </div>
    ) },
  { key: 'cli', header: 'Cliente', sortKey: 'cliente',
    cell: (r: OcupacionEspacio) => r.cli_nom ?? '—', cellClassName: 'text-gray-700' },
  { key: 'desde', header: 'Desde', sortKey: 'desde', headerClassName: 'w-28',
    cell: (r: OcupacionEspacio) => r.res_fec_desde ? formatDate(r.res_fec_desde) : '—', cellClassName: 'text-gray-600 text-xs' },
  { key: 'hasta', header: 'Hasta', sortKey: 'hasta', headerClassName: 'w-28',
    cell: (r: OcupacionEspacio) => r.res_fec_hasta ? formatDate(r.res_fec_hasta) : '—', cellClassName: 'text-gray-600 text-xs' },
  { key: 'cant', header: 'Cant.', headerClassName: 'text-right w-16 hidden lg:table-cell',
    cell: (r: OcupacionEspacio) => r.res_cant != null ? `${r.res_cant} ${r.res_um ?? ''}`.trim() : '—',
    cellClassName: 'text-right text-xs text-gray-500 hidden lg:table-cell' },
  { key: 'precio', header: 'Precio', sortKey: 'precio', headerClassName: 'text-right w-32 hidden sm:table-cell',
    cell: (r: OcupacionEspacio) => fmt(r.res_precio),
    cellClassName: 'text-right tabular-nums text-gray-700 hidden sm:table-cell' },
  { key: 'pedido', header: 'Pedido', sortKey: 'pedido', headerClassName: 'w-24 hidden md:table-cell',
    cell: (r: OcupacionEspacio) => r.res_nro_ped ?? '—',
    cellClassName: 'font-mono text-xs text-gray-500 hidden md:table-cell' },
  { key: 'estado', header: 'Estado',
    cell: (r: OcupacionEspacio) => {
      const e = ESTADO[r.res_estado] ?? { label: r.res_estado, cls: 'bg-gray-100 text-gray-500' };
      return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${e.cls}`}>{e.label}</span>;
    } },
];

const PAGE_ID = 'ocupaciones';
const DEFAULTS = { ubicacion: '', search: '' };

export default function OcupacionesPage() {
  const [filters, setFilter] = useFilters(PAGE_ID, DEFAULTS);
  const sf = (key: keyof typeof DEFAULTS, value: string) => { setFilter(key, value); setPage(1); };

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => {
    const t = setTimeout(() => sf('search', searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading } = useQuery({
    queryKey: ['ocupaciones', { page, limit, search: filters.search, sortField, sortDir, ubicacion: filters.ubicacion }],
    queryFn: () => getOcupaciones({ page, limit, search: filters.search, sortField, sortDir, ubicacion: filters.ubicacion } as any),
  });

  const { data: ubicaciones } = useQuery({
    queryKey: ['ubicaciones'],
    queryFn: getUbicaciones,
  });

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Ocupación de espacios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Consulta de espacios publicitarios reservados</p>
        </div>
        <ExportButton filename="ocupaciones" fetchData={() => getOcupaciones({ all: true } as any)} columns={[
          { header: 'Espacio', value: (r) => r.art_desc },
          { header: 'Ubicación', value: (r) => r.res_grupo_desc },
          { header: 'Cliente', value: (r) => r.cli_nom },
          { header: 'Desde', value: (r) => r.res_fec_desde },
          { header: 'Hasta', value: (r) => r.res_fec_hasta },
          { header: 'Precio', value: (r) => r.res_precio },
          { header: 'Pedido', value: (r) => r.res_nro_ped },
          { header: 'Estado', value: (r) => r.res_estado },
        ]} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchField value={searchInput} onChange={setSearchInput} placeholder="Buscar por espacio, cliente, pedido o ubicación..." />
          </div>
          <select value={filters.ubicacion} onChange={(e) => sf('ubicacion', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 sm:w-56">
            <option value="">Todas las ubicaciones</option>
            {(ubicaciones ?? []).map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <DataTable
          isLoading={isLoading}
          rows={rows}
          getRowKey={(r) => `${r.res_cod_reserva}-${r.res_cod_art}`}
          tableClassName="w-full text-sm min-w-[600px]"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
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
