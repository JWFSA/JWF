'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getLiquidaciones } from '@/services/per';
import { formatDate } from '@/lib/utils';
import type { Liquidacion } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'empleado', header: 'Empleado',   sortKey: 'empleado',                                          cell: (r: Liquidacion) => `${r.empl_nombre ?? ''} ${r.empl_ape ?? ''}`.trim() || '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'fecha',    header: 'Fecha',       sortKey: 'fecha',    headerClassName: 'w-24',                 cell: (r: Liquidacion) => formatDate(r.pdoc_fec),   cellClassName: 'text-xs text-gray-600' },
  { key: 'periodo',  header: 'Período',     sortKey: 'periodo',  headerClassName: 'hidden sm:table-cell w-20', cell: (r: Liquidacion) => r.pdoc_periodo ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-center text-gray-500' },
  { key: 'quinc',    header: 'Quinc.',                            headerClassName: 'hidden sm:table-cell w-16', cell: (r: Liquidacion) => r.pdoc_quincena ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-center text-gray-500' },
  { key: 'proc',     header: 'Procesado',                         headerClassName: 'hidden md:table-cell w-20', cell: (r: Liquidacion) => r.pdoc_procesado === 'S' ? 'Sí' : 'No', cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
];

export default function LiquidacionesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['per-liquidaciones', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getLiquidaciones({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Liquidaciones</h1>
        <p className="text-sm text-gray-500 mt-0.5">Documentos de liquidación de sueldos</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por empleado..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.pdoc_clave} columns={COLUMNS}
          onEdit={(r) => router.push(`/per/liquidaciones/${r.pdoc_clave}`)}
          tableClassName="w-full text-sm min-w-[400px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
