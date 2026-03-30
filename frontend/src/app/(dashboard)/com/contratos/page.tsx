'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getContratosProv, deleteContratoProv } from '@/services/com';
import { formatDate } from '@/lib/utils';
import type { ContratoProv } from '@/types/com';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

const COLUMNS = [
  { key: 'clave',   header: 'Clave',      sortKey: 'clave',   headerClassName: 'w-24',                   cell: (r: ContratoProv) => r.cont_clave,                    cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',   header: 'Fecha',       sortKey: 'fecha',   headerClassName: 'w-28',                   cell: (r: ContratoProv) => formatDate(r.cont_fecha),        cellClassName: 'text-xs text-gray-600' },
  { key: 'prov',    header: 'Proveedor',   sortKey: 'prov',                                               cell: (r: ContratoProv) => r.prov_nom ?? '—',               cellClassName: 'font-medium text-gray-800' },
  { key: 'mon',     header: 'Moneda',                           headerClassName: 'hidden sm:table-cell w-20', cell: (r: ContratoProv) => r.mon_desc ?? '—',            cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'total',   header: 'Total',       sortKey: 'total',   headerClassName: 'hidden md:table-cell w-32 text-right', cell: (r: ContratoProv) => fmt(r.cont_imp_total), cellClassName: 'hidden md:table-cell text-right tabular-nums text-gray-700' },
  { key: 'vigente', header: 'Vigente',     sortKey: 'vigente', headerClassName: 'hidden sm:table-cell w-20', cell: (r: ContratoProv) => r.cont_ind_vigente === 'S' ? 'Sí' : 'No', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
];

export default function ContratosProvPage() {
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
    queryKey: ['contratos-prov', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getContratosProv({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const contratos  = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteContratoProv,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contratos-prov'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Contratos de proveedor</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de contratos con proveedores</p>
        </div>
        <PrimaryAddButton label="Nuevo contrato" shortLabel="Nuevo" onClick={() => router.push('/com/contratos/nuevo')} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por clave, proveedor u observación..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={contratos}
          getRowKey={(r) => r.cont_clave}
          onEdit={(r) => router.push(`/com/contratos/${r.cont_clave}`)}
          onDelete={(r) => deleteMut.mutate(r.cont_clave)}
          deleteConfirmMessage="¿Eliminar este contrato?"
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
