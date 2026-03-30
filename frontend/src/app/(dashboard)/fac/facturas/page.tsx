'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getFacturas, deleteFactura } from '@/services/fac';
import { formatDate } from '@/lib/utils';
import type { Factura } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';

const fmt = (n: number | null | undefined) =>
  n != null ? Number(n).toLocaleString('es-PY') : '—';

const COLUMNS = [
  { key: 'nro',    header: 'Nro.',    sortKey: 'nro',    headerClassName: 'w-32',                    cell: (r: Factura) => r.doc_nro_doc,                      cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',  header: 'Fecha',   sortKey: 'fecha',  headerClassName: 'w-28',                    cell: (r: Factura) => formatDate(r.doc_fec_doc),          cellClassName: 'text-xs text-gray-600' },
  { key: 'cli',    header: 'Cliente', sortKey: 'cliente',                                             cell: (r: Factura) => r.cli_nom ?? r.doc_cli_nom ?? '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'timb',   header: 'Timbrado',                   headerClassName: 'hidden sm:table-cell w-32', cell: (r: Factura) => r.doc_nro_timbrado ?? '—',        cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'total',  header: 'Total',   sortKey: 'total',  headerClassName: 'hidden md:table-cell w-36 text-right',
    cell: (r: Factura) => fmt(r.doc_saldo_loc),
    cellClassName: 'hidden md:table-cell text-xs text-right font-mono text-gray-700' },
  { key: 'obs',    header: 'Obs.',                       headerClassName: 'hidden lg:table-cell',    cell: (r: Factura) => r.doc_obs ?? '—',                  cellClassName: 'hidden lg:table-cell text-xs text-gray-400 truncate max-w-[160px]' },
];

export default function FacturasPage() {
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
    queryKey: ['facturas', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getFacturas({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const facturas = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteFactura,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['facturas'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Facturas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Facturas de venta emitidas</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton filename="facturas" fetchData={() => getFacturas({ all: true })} columns={[
            { header: 'Nro.', value: (r) => r.fac_nro },
            { header: 'Fecha', value: (r) => r.fac_fecha },
            { header: 'Cliente', value: (r) => r.cli_nom },
            { header: 'Moneda', value: (r) => r.mon_desc },
            { header: 'Gravada 10%', value: (r) => r.doc_grav_10_loc },
            { header: 'Gravada 5%', value: (r) => r.doc_grav_5_loc },
            { header: 'Exenta', value: (r) => r.doc_neto_exen_loc },
            { header: 'IVA 10%', value: (r) => r.doc_iva_10_loc },
            { header: 'IVA 5%', value: (r) => r.doc_iva_5_loc },
            { header: 'Saldo', value: (r) => r.doc_saldo_loc },
          ]} />
          <PrimaryAddButton label="Nueva factura" shortLabel="Nueva" onClick={() => router.push('/fac/facturas/nuevo')} />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por cliente, nro. o timbrado..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={facturas}
          getRowKey={(r) => r.doc_clave}
          onEdit={(r) => router.push(`/fac/facturas/${r.doc_clave}`)}
          onDelete={(r) => deleteMut.mutate(r.doc_clave)}
          deleteConfirmMessage="¿Eliminar esta factura?"
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
