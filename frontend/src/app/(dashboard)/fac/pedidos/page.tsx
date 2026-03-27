'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getPedidos, deletePedido } from '@/services/fac';
import { formatDate } from '@/lib/utils';
import type { Pedido } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const ESTADO: Record<string, { label: string; cls: string }> = {
  P: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-700' },
  A: { label: 'Aprobado',  cls: 'bg-green-100 text-green-700'  },
  C: { label: 'Cerrado',   cls: 'bg-gray-100 text-gray-500'   },
};

const fmtTotal = (n?: number) =>
  n != null ? new Intl.NumberFormat('es-PY').format(Number(n)) : '—';

const COLUMNS = [
  { key: 'nro',    header: 'Nro.',     sortKey: 'nro',     headerClassName: 'w-28', cell: (p: Pedido) => p.ped_nro, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',  header: 'Fecha',    sortKey: 'fecha',   headerClassName: 'w-36', cell: (p: Pedido) => formatDate(p.ped_fecha), cellClassName: 'text-gray-600' },
  { key: 'cli',    header: 'Cliente',  sortKey: 'cliente', cell: (p: Pedido) => p.cli_nom ?? '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'vend',   header: 'Vendedor', headerClassName: 'hidden md:table-cell',
    cell: (p: Pedido) => p.vend_nombre ? `${p.vend_nombre} ${p.vend_apellido ?? ''}`.trim() : '—',
    cellClassName: 'text-gray-500 hidden md:table-cell' },
  { key: 'total',  header: 'Total',    sortKey: 'total',   headerClassName: 'hidden sm:table-cell text-right',
    cell: (p: Pedido) => fmtTotal(p.ped_imp_total_mon),
    cellClassName: 'text-right tabular-nums text-gray-700 hidden sm:table-cell' },
  { key: 'estado', header: 'Estado',   sortKey: 'estado',
    cell: (p: Pedido) => {
      const e = ESTADO[p.ped_estado] ?? { label: p.ped_estado, cls: 'bg-gray-100 text-gray-500' };
      return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${e.cls}`}>{e.label}</span>;
    } },
];

export default function PedidosPage() {
  const router = useRouter();
  const qc = useQueryClient();
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
    queryKey: ['pedidos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getPedidos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const pedidos    = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deletePedido,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Órdenes de venta</p>
        </div>
        <PrimaryAddButton label="Nuevo pedido" shortLabel="Nuevo" href="/fac/pedidos/nuevo" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por cliente, nro. o producto..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={pedidos}
          getRowKey={(p) => p.ped_clave}
          onEdit={(p) => router.push(`/fac/pedidos/${p.ped_clave}`)}
          onDelete={(p) => deleteMut.mutate(p.ped_clave)}
          deleteConfirmMessage="¿Eliminar este pedido?"
          tableClassName="w-full min-w-[700px] text-sm"
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
