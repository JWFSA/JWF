'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getSolicitudesDescuento } from '@/services/fac';
import { formatDate } from '@/lib/utils';
import type { SolicitudDescuento } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'nro',     header: 'Nro.',       sortKey: 'nro',   headerClassName: 'w-20',                   cell: (r: SolicitudDescuento) => r.sod_nro,                     cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',   header: 'Fecha',      sortKey: 'fecha', headerClassName: 'w-28',                   cell: (r: SolicitudDescuento) => formatDate(r.sod_fecha_sol),   cellClassName: 'text-xs text-gray-600' },
  { key: 'usuario', header: 'Solicitante',                                                              cell: (r: SolicitudDescuento) => r.sod_login_sol ?? '—',        cellClassName: 'font-medium text-gray-800' },
  { key: 'pedido',  header: 'Pedido',                        headerClassName: 'hidden sm:table-cell w-24', cell: (r: SolicitudDescuento) => r.sod_clave_ped ?? '—',      cellClassName: 'hidden sm:table-cell font-mono text-xs text-gray-500' },
  { key: 'items',   header: 'Ítems',                         headerClassName: 'hidden sm:table-cell w-16 text-center', cell: (r: SolicitudDescuento) => r.cant_items ?? 0, cellClassName: 'hidden sm:table-cell text-center text-xs text-gray-500' },
];

export default function SolicitudesDescuentoPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['fac-sol-descuento', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getSolicitudesDescuento({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Solicitudes de descuento</h1>
          <p className="text-sm text-gray-500 mt-0.5">Solicitudes de descuento sobre pedidos</p>
        </div>
        <PrimaryAddButton label="Nueva solicitud" shortLabel="Nueva" href="/fac/solicitudes-descuento/nuevo" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nro o solicitante..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.sod_clave} columns={COLUMNS}
          onEdit={(r) => router.push(`/fac/solicitudes-descuento/${r.sod_clave}`)}
          tableClassName="w-full text-sm min-w-[400px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
