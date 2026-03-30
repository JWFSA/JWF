'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComisiones } from '@/services/fac';
import { formatDate } from '@/lib/utils';
import type { ComisionFac } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const ESTADO: Record<string, string> = { A: 'Activa', I: 'Inactiva' };
const fmt = (n: number | null | undefined) =>
  n == null ? '—' : `${Number(n).toFixed(2)}%`;

const COLUMNS = [
  { key: 'nro',   header: 'Nro.',        sortKey: 'nro',   headerClassName: 'w-16',                   cell: (r: ComisionFac) => r.com_nro,                cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'art',   header: 'Artículo',    sortKey: 'art',                                              cell: (r: ComisionFac) => r.com_art_desc ?? '—',    cellClassName: 'font-medium text-gray-800 truncate max-w-[180px]' },
  { key: 'clas',  header: 'Clasificación', sortKey: 'clas', headerClassName: 'hidden md:table-cell',   cell: (r: ComisionFac) => r.com_clas_desc ?? '—',   cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'dir',   header: '% Dir.',                         headerClassName: 'hidden sm:table-cell w-20 text-right', cell: (r: ComisionFac) => fmt(r.com_porc_base_dir), cellClassName: 'hidden sm:table-cell text-right text-xs text-gray-600' },
  { key: 'age',   header: '% Age.',                         headerClassName: 'hidden sm:table-cell w-20 text-right', cell: (r: ComisionFac) => fmt(r.com_porc_base_age), cellClassName: 'hidden sm:table-cell text-right text-xs text-gray-600' },
  { key: 'est',   header: 'Estado',                         headerClassName: 'hidden sm:table-cell w-20', cell: (r: ComisionFac) => ESTADO[r.com_estado ?? ''] ?? r.com_estado ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
];

export default function ComisionesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['fac-comisiones', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getComisiones({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Comisiones</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tabla de comisiones por artículo y clasificación</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por artículo, clasificación o nro..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.com_clave} columns={COLUMNS}
          tableClassName="w-full text-sm min-w-[400px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
