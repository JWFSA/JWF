'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCobros } from '@/services/fin';
import { formatDate } from '@/lib/utils';
import type { Cobro } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const fmt = (n?: number | null) => n != null ? Number(n).toLocaleString('es-PY') : '—';

const COLUMNS = [
  { key: 'fecha', header: 'Fecha pago', sortKey: 'fecha', headerClassName: 'w-28',
    cell: (c: Cobro) => formatDate(c.pag_fec_pago), cellClassName: 'text-gray-600' },
  { key: 'nro', header: 'Factura', sortKey: 'nro', headerClassName: 'w-28',
    cell: (c: Cobro) => c.doc_nro_doc, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fec_doc', header: 'Fecha fact.', headerClassName: 'w-28 hidden md:table-cell',
    cell: (c: Cobro) => formatDate(c.doc_fec_doc), cellClassName: 'text-gray-500 hidden md:table-cell' },
  { key: 'cli', header: 'Cliente', sortKey: 'cliente',
    cell: (c: Cobro) => c.cli_nom ?? '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'importe', header: 'Importe', sortKey: 'importe', headerClassName: 'text-right w-32',
    cell: (c: Cobro) => fmt(c.pag_imp_loc), cellClassName: 'text-right tabular-nums text-green-700 font-medium' },
  { key: 'usuario', header: 'Usuario', headerClassName: 'hidden lg:table-cell w-24',
    cell: (c: Cobro) => c.pag_login ?? '—', cellClassName: 'text-gray-400 text-xs hidden lg:table-cell' },
];

export default function CobrosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['cobros', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getCobros({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const cobros = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Historial de cobros</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pagos registrados contra facturas</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por cliente o nro. de factura..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={cobros}
          getRowKey={(c) => `${c.pag_clave_doc}-${c.pag_fec_vto}-${c.pag_fec_pago}`}
          tableClassName="w-full text-sm min-w-[500px]"
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
