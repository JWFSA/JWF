'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getOrdenesCompra, deleteOrdenCompra } from '@/services/com';
import { formatDate } from '@/lib/utils';
import type { OrdenCompra } from '@/types/com';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const ESTADOS: Record<string, string> = { PE: 'Pendiente', AU: 'Autorizada', AN: 'Anulada' };
const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

const COLUMNS = [
  { key: 'nro',    header: 'Nro.',       sortKey: 'nro',    headerClassName: 'w-20',                   cell: (r: OrdenCompra) => r.orcom_nro,                              cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',  header: 'Fecha',      sortKey: 'fecha',  headerClassName: 'w-28',                   cell: (r: OrdenCompra) => formatDate(r.orcom_fec_emis),             cellClassName: 'text-xs text-gray-600' },
  { key: 'prov',   header: 'Proveedor',  sortKey: 'prov',                                              cell: (r: OrdenCompra) => r.prov_nom ?? '—',                        cellClassName: 'font-medium text-gray-800' },
  { key: 'mon',    header: 'Moneda',                         headerClassName: 'hidden sm:table-cell w-20', cell: (r: OrdenCompra) => r.mon_desc ?? '—',                     cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'total',  header: 'Total',      sortKey: 'total',  headerClassName: 'hidden md:table-cell w-32 text-right', cell: (r: OrdenCompra) => fmt(r.orcom_total),           cellClassName: 'hidden md:table-cell text-right tabular-nums text-gray-700' },
  { key: 'estado', header: 'Estado',     sortKey: 'estado', headerClassName: 'hidden sm:table-cell w-28', cell: (r: OrdenCompra) => ESTADOS[r.orcom_estado ?? ''] ?? r.orcom_estado ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'fpago',  header: 'Forma pago',                    headerClassName: 'hidden lg:table-cell w-36', cell: (r: OrdenCompra) => r.orcom_forma_pago ?? '—',              cellClassName: 'hidden lg:table-cell text-xs text-gray-500' },
];

export default function OrdenesCompraPage() {
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
    queryKey: ['ordenes-compra', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getOrdenesCompra({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const ordenes    = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteOrdenCompra,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes-compra'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Órdenes de compra</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de órdenes de compra a proveedores</p>
        </div>
        <PrimaryAddButton label="Nueva orden" shortLabel="Nueva" onClick={() => router.push('/com/ordenes-compra/nuevo')} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nro, proveedor u observación..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={ordenes}
          getRowKey={(r) => r.orcom_nro}
          onEdit={(r) => router.push(`/com/ordenes-compra/${r.orcom_nro}`)}
          onDelete={(r) => deleteMut.mutate(r.orcom_nro)}
          deleteConfirmMessage="¿Eliminar esta orden de compra?"
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
