'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCheques } from '@/services/fin';
import { formatDate } from '@/lib/utils';
import type { Cheque } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';

const SITUACION: Record<string, string> = { C: 'En cartera', D: 'Depositado', R: 'Rechazado', E: 'Entregado', N: 'Anulado' };
const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

const COLUMNS = [
  { key: 'nro',     header: 'Nro.',          sortKey: 'nro',     headerClassName: 'w-24',                   cell: (r: Cheque) => r.cheq_nro,                            cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',   header: 'Emisión',       sortKey: 'fecha',   headerClassName: 'w-24',                   cell: (r: Cheque) => formatDate(r.cheq_fec_emis),           cellClassName: 'text-xs text-gray-600' },
  { key: 'cliente', header: 'Cliente/Titular',                                                               cell: (r: Cheque) => r.cheq_cli_nom ?? r.cheq_titular ?? '—', cellClassName: 'font-medium text-gray-800 truncate max-w-[180px]' },
  { key: 'banco',   header: 'Banco',         sortKey: 'banco',   headerClassName: 'hidden md:table-cell w-32', cell: (r: Cheque) => r.bco_desc ?? '—',                  cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'vto',     header: 'Vto.',          sortKey: 'vto',     headerClassName: 'hidden sm:table-cell w-24', cell: (r: Cheque) => formatDate(r.cheq_fec_depositar),    cellClassName: 'hidden sm:table-cell text-xs text-gray-600' },
  { key: 'imp',     header: 'Importe',       sortKey: 'importe', headerClassName: 'w-28 text-right',         cell: (r: Cheque) => fmt(r.cheq_importe),                    cellClassName: 'text-right tabular-nums text-gray-700' },
  { key: 'sit',     header: 'Situación',                          headerClassName: 'hidden sm:table-cell w-24', cell: (r: Cheque) => SITUACION[r.cheq_situacion ?? ''] ?? r.cheq_situacion ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
];

export default function ChequesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['fin-cheques', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getCheques({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const cheques    = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Cheques recibidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de cheques recibidos de clientes</p>
        </div>
        <ExportButton filename="cheques-recibidos" fetchData={() => getCheques({ all: true })} columns={[
          { header: 'Nro.', value: (r) => r.cheq_nro },
          { header: 'Emisión', value: (r) => r.cheq_fec_emis },
          { header: 'Vencimiento', value: (r) => r.cheq_fec_depositar },
          { header: 'Cliente', value: (r) => r.cheq_cli_nom },
          { header: 'Titular', value: (r) => r.cheq_titular },
          { header: 'Banco', value: (r) => r.bco_desc },
          { header: 'Importe', value: (r) => r.cheq_importe },
          { header: 'Situación', value: (r) => r.cheq_situacion },
        ]} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nro, cliente o titular..." />
        </div>
        <DataTable
          isLoading={isLoading} rows={cheques} getRowKey={(r) => r.cheq_clave} columns={COLUMNS}
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
