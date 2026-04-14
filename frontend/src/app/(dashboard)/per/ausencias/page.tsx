'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAusencias } from '@/services/per';
import { formatDate } from '@/lib/utils';
import type { Ausencia } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

const COLUMNS = [
  { key: 'empleado', header: 'Empleado',     sortKey: 'empleado',                                           cell: (r: Ausencia) => `${r.empl_nombre ?? ''} ${r.empl_ape ?? ''}`.trim() || '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'fecha',    header: 'Fecha',         sortKey: 'fecha',    headerClassName: 'w-24',                  cell: (r: Ausencia) => formatDate(r.aus_fecha),      cellClassName: 'text-xs text-gray-600' },
  { key: 'motivo',   header: 'Motivo',                              headerClassName: 'hidden md:table-cell', cell: (r: Ausencia) => r.motivo_desc ?? '—',         cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'just',     header: 'Justif.',                              headerClassName: 'hidden sm:table-cell w-16', cell: (r: Ausencia) => r.aus_justificada === 'S' ? 'Sí' : 'No', cellClassName: 'hidden sm:table-cell text-xs text-center text-gray-500' },
  { key: 'dcto',     header: 'Descuento',                           headerClassName: 'hidden sm:table-cell w-16', cell: (r: Ausencia) => r.aus_ind_descuento === 'S' ? 'Sí' : 'No', cellClassName: 'hidden sm:table-cell text-xs text-center text-gray-500' },
  { key: 'obs',      header: 'Observación',                         headerClassName: 'hidden lg:table-cell', cell: (r: Ausencia) => r.aus_obs ?? '—',             cellClassName: 'hidden lg:table-cell text-xs text-gray-500 truncate max-w-[200px]' },
];

export default function AusenciasPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['per-ausencias', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getAusencias({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Ausencias</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registro de ausencias de empleados</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por empleado u observación..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => `${r.aus_legajo}-${r.aus_fecha}`} columns={COLUMNS}
          tableClassName="w-full text-sm min-w-[450px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
