'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStock, getDepositos } from '@/services/stk';
import type { StockActual } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY', { maximumFractionDigits: 3 }).format(Number(n));

const COLUMNS = [
  { key: 'art',    header: 'Artículo',     sortKey: 'art',   cell: (r: StockActual) => r.art_desc,                        cellClassName: 'font-medium text-gray-800' },
  { key: 'fabr',   header: 'Cód. fábrica',               headerClassName: 'hidden md:table-cell w-32', cell: (r: StockActual) => r.art_codigo_fabrica ?? '—', cellClassName: 'hidden md:table-cell font-mono text-xs text-gray-500' },
  { key: 'um',     header: 'UM',                         headerClassName: 'w-16',                       cell: (r: StockActual) => r.art_unid_med ?? '—',      cellClassName: 'text-xs text-gray-500' },
  { key: 'dep',    header: 'Depósito',     sortKey: 'dep',   headerClassName: 'hidden sm:table-cell',   cell: (r: StockActual) => r.dep_desc,                  cellClassName: 'hidden sm:table-cell text-gray-600' },
  { key: 'ubic',   header: 'Ubicación',                  headerClassName: 'hidden lg:table-cell w-24', cell: (r: StockActual) => r.arde_ubic ?? '—',          cellClassName: 'hidden lg:table-cell text-xs text-gray-400' },
  { key: 'ent',    header: 'Entradas',    sortKey: 'ent',   headerClassName: 'hidden lg:table-cell w-24 text-right', cell: (r: StockActual) => fmt(r.arde_cant_ent), cellClassName: 'hidden lg:table-cell text-right text-xs text-green-600 tabular-nums' },
  { key: 'sal',    header: 'Salidas',     sortKey: 'sal',   headerClassName: 'hidden lg:table-cell w-24 text-right', cell: (r: StockActual) => fmt(r.arde_cant_sal), cellClassName: 'hidden lg:table-cell text-right text-xs text-red-500 tabular-nums' },
  { key: 'stock',  header: 'Stock actual', sortKey: 'stock', headerClassName: 'w-28 text-right',        cell: (r: StockActual) => fmt(r.arde_cant_act),        cellClassName: 'text-right font-semibold tabular-nums' },
];

export default function StockActualPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('art');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [depFilter, setDepFilter] = useState<number | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: depositosData } = useQuery({
    queryKey: ['depositos', { all: true }],
    queryFn: () => getDepositos({ all: true }),
  });
  const depositos = depositosData?.data ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ['stock', { page, limit, search: debouncedSearch, dep: depFilter, sortField, sortDir }],
    queryFn: () => getStock({ page, limit, search: debouncedSearch, dep: depFilter, sortField, sortDir }),
  });

  const rows       = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Stock actual</h1>
        <p className="text-sm text-gray-500 mt-0.5">Existencias por artículo y depósito</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por artículo o código de fábrica..." />
          <select
            value={depFilter ?? ''}
            onChange={(e) => { setDepFilter(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 sm:w-52"
          >
            <option value="">Todos los depósitos</option>
            {depositos.map((d) => (
              <option key={d.dep_codigo} value={d.dep_codigo}>{d.dep_desc}</option>
            ))}
          </select>
        </div>
        <DataTable
          isLoading={isLoading}
          rows={rows}
          getRowKey={(r) => `${r.arde_dep}-${r.arde_art}`}
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
