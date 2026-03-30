'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChequesEmit } from '@/services/fin';
import { formatDate } from '@/lib/utils';
import type { ChequeEmit } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

const COLUMNS = [
  { key: 'nro',    header: 'Nro.',          sortKey: 'nro',     headerClassName: 'w-24',                   cell: (r: ChequeEmit) => r.ch_emit_nro,                    cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'vto',    header: 'Vencimiento',   sortKey: 'vto',     headerClassName: 'w-28',                   cell: (r: ChequeEmit) => formatDate(r.ch_emit_fec_vto),    cellClassName: 'text-xs text-gray-600' },
  { key: 'benef',  header: 'Beneficiario',  sortKey: 'benef',                                              cell: (r: ChequeEmit) => r.ch_emit_beneficiario ?? '—',    cellClassName: 'font-medium text-gray-800' },
  { key: 'serie',  header: 'Serie',                              headerClassName: 'hidden sm:table-cell w-16', cell: (r: ChequeEmit) => r.ch_emit_serie ?? '—',        cellClassName: 'hidden sm:table-cell text-xs text-center text-gray-500' },
  { key: 'imp',    header: 'Importe',       sortKey: 'importe', headerClassName: 'w-32 text-right',         cell: (r: ChequeEmit) => fmt(r.ch_emit_importe),           cellClassName: 'text-right tabular-nums text-gray-700' },
];

export default function ChequesEmitidosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('vto');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['fin-cheques-emit', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getChequesEmit({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Cheques emitidos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Cheques emitidos a proveedores y beneficiarios</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nro o beneficiario..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.ch_emit_clave} columns={COLUMNS}
          tableClassName="w-full text-sm min-w-[450px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
