'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getOrdenesPago, deleteOrdenPago } from '@/services/fin';
import { formatDate } from '@/lib/utils';
import type { OrdenPago } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const ESTADOS: Record<string, string> = { P: 'Pendiente', A: 'Aprobada', C: 'Completada', X: 'Anulada' };
const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

const COLUMNS = [
  { key: 'codigo',  header: 'Nro.',        sortKey: 'codigo', headerClassName: 'w-20',                   cell: (r: OrdenPago) => r.ordp_codigo,                              cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',   header: 'Fecha',        sortKey: 'fecha',  headerClassName: 'w-28',                   cell: (r: OrdenPago) => formatDate(r.ordp_fec_orden), cellClassName: 'text-xs text-gray-600' },
  { key: 'benef',   header: 'Beneficiario', sortKey: 'benef',                                              cell: (r: OrdenPago) => r.ordp_beneficiario ?? r.prov_nom ?? '—',   cellClassName: 'font-medium text-gray-800' },
  { key: 'mon',     header: 'Moneda',                          headerClassName: 'hidden sm:table-cell w-20', cell: (r: OrdenPago) => r.mon_desc ?? '—',                        cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'total',   header: 'Total',        sortKey: 'total',  headerClassName: 'hidden md:table-cell w-32 text-right', cell: (r: OrdenPago) => fmt(r.ordp_tot_pago),          cellClassName: 'hidden md:table-cell text-right tabular-nums text-gray-700' },
  { key: 'estado',  header: 'Estado',       sortKey: 'estado', headerClassName: 'hidden sm:table-cell w-28', cell: (r: OrdenPago) => ESTADOS[r.ordp_estado ?? ''] ?? r.ordp_estado ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
];

export default function OrdenesPagoPage() {
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
    queryKey: ['ordenes-pago', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getOrdenesPago({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const ordenes    = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteOrdenPago,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes-pago'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Órdenes de pago</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pagos a proveedores y beneficiarios</p>
        </div>
        <PrimaryAddButton label="Nueva orden" shortLabel="Nueva" onClick={() => router.push('/fin/ordenes-pago/nuevo')} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por beneficiario, proveedor o nro..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={ordenes}
          getRowKey={(r) => r.ordp_clave}
          onEdit={(r) => router.push(`/fin/ordenes-pago/${r.ordp_clave}`)}
          onDelete={(r) => deleteMut.mutate(r.ordp_clave)}
          deleteConfirmMessage="¿Eliminar esta orden de pago?"
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
