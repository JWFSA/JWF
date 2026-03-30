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

export default function DocumentosFinPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['fin-documentos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getDocumentosFin({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const docs       = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Documentos financieros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Facturas, notas de crédito, recibos y otros documentos</p>
        </div>
      </div>
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
