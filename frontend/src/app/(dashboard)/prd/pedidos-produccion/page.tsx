'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getPedidosProduccion } from '@/services/prd';
import { formatDate } from '@/lib/utils';
import type { PedidoProduccion } from '@/types/prd';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const EST: Record<string, { label: string; cls: string }> = {
  P: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-700' },
  E: { label: 'En proceso', cls: 'bg-blue-100 text-blue-700' },
  T: { label: 'Terminado', cls: 'bg-green-100 text-green-700' },
};

const COLUMNS = [
  { key: 'nro',     header: 'Nro.',     sortKey: 'nro',     headerClassName: 'w-20', cell: (r: PedidoProduccion) => r.pp_nro, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',   header: 'Fecha',    sortKey: 'fecha',   headerClassName: 'w-28', cell: (r: PedidoProduccion) => formatDate(r.pp_fec_emis), cellClassName: 'text-gray-600' },
  { key: 'cli',     header: 'Cliente',  sortKey: 'cliente', cell: (r: PedidoProduccion) => r.pp_cli_nom ?? '\u2014', cellClassName: 'font-medium text-gray-800' },
  { key: 'pedido',  header: 'Pedido',   headerClassName: 'w-24 hidden sm:table-cell', cell: (r: PedidoProduccion) => r.pp_nro_pedido ?? '\u2014', cellClassName: 'hidden sm:table-cell font-mono text-xs text-gray-500' },
  { key: 'items',   header: '\u00cdtems', headerClassName: 'w-16 text-center hidden sm:table-cell', cell: (r: PedidoProduccion) => r.cant_items ?? 0, cellClassName: 'hidden sm:table-cell text-center text-xs' },
  { key: 'entrega', header: 'Entrega',  headerClassName: 'w-28 hidden md:table-cell', cell: (r: PedidoProduccion) => r.pp_fec_ent ? formatDate(r.pp_fec_ent) : '\u2014', cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'estado',  header: 'Estado',   cell: (r: PedidoProduccion) => { const e = EST[r.pp_estado ?? ''] ?? { label: r.pp_estado ?? '\u2014', cls: 'bg-gray-100 text-gray-500' }; return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${e.cls}`}>{e.label}</span>; } },
];

export default function PedidosProduccionPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['pedidos-produccion', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getPedidosProduccion({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Pedidos de producci{'\u00f3'}n</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pedidos generados desde {'\u00f3'}rdenes de venta</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nro o cliente..." />
        </div>
        <DataTable isLoading={isLoading} rows={data?.data ?? []} getRowKey={(r) => r.pp_clave}
          onEdit={(r) => router.push(`/prd/pedidos-produccion/${r.pp_clave}`)}
          tableClassName="w-full min-w-[600px] text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }}
          columns={COLUMNS} />
        {data?.pagination && <TablePagination total={data.pagination.total} page={page} limit={limit} totalPages={data.pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
