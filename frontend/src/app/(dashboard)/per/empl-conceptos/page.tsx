'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEmplConceptos } from '@/services/per';
import { formatDate } from '@/lib/utils';
import type { EmplConcepto } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

const COLUMNS = [
  { key: 'empleado', header: 'Empleado',  sortKey: 'empleado',                                         cell: (r: EmplConcepto) => `${r.empl_nombre ?? ''} ${r.empl_ape ?? ''}`.trim() || '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'concepto', header: 'Concepto',  sortKey: 'concepto',                                         cell: (r: EmplConcepto) => r.concepto_desc ?? '—',       cellClassName: 'text-gray-600' },
  { key: 'importe',  header: 'Importe',   sortKey: 'importe',  headerClassName: 'w-28 text-right',     cell: (r: EmplConcepto) => fmt(r.percon_imp),             cellClassName: 'text-right tabular-nums text-gray-700' },
  { key: 'fecha',    header: 'Fec. pago', sortKey: 'fecha',    headerClassName: 'hidden sm:table-cell w-24', cell: (r: EmplConcepto) => formatDate(r.percon_fec_pago), cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'genera',   header: 'Genera',                          headerClassName: 'hidden md:table-cell w-16', cell: (r: EmplConcepto) => r.percon_genera === 'S' ? 'Sí' : 'No', cellClassName: 'hidden md:table-cell text-xs text-center text-gray-500' },
];

export default function EmplConceptosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('empleado');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['per-empl-conceptos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getEmplConceptos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Conceptos fijos por empleado</h1>
        <p className="text-sm text-gray-500 mt-0.5">Conceptos de haberes/descuentos asignados a cada empleado</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por empleado o concepto..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => `${r.percon_empleado}-${r.percon_concepto}`} columns={COLUMNS}
          tableClassName="w-full text-sm min-w-[450px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
