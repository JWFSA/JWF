'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCuentas, deleteCuenta } from '@/services/cnt';
import type { Cuenta } from '@/types/cnt';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'nro',   header: 'Número',      sortKey: 'nro',   headerClassName: 'w-28',  cell: (r: Cuenta) => r.ctac_nro,                cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',  header: 'Descripción',  sortKey: 'desc',                             cell: (r: Cuenta) => r.ctac_desc,               cellClassName: 'font-medium text-gray-800' },
  { key: 'nivel', header: 'Nivel',        sortKey: 'nivel', headerClassName: 'hidden sm:table-cell w-16', cell: (r: Cuenta) => r.ctac_nivel ?? '—', cellClassName: 'hidden sm:table-cell text-xs text-center text-gray-500' },
  { key: 'grupo', header: 'Grupo',                          headerClassName: 'hidden md:table-cell w-28', cell: (r: Cuenta) => r.grupo_desc ?? '—', cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'imp',   header: 'Imputable',                      headerClassName: 'hidden lg:table-cell w-20', cell: (r: Cuenta) => r.ctac_ind_imputable === 'S' ? 'Sí' : 'No', cellClassName: 'hidden lg:table-cell text-xs text-gray-500' },
];

export default function CuentasPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('nro');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['cnt-cuentas', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getCuentas({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const cuentas    = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteCuenta,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cnt-cuentas'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Plan de cuentas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Estructura contable de la empresa</p>
        </div>
        <PrimaryAddButton label="Nueva cuenta" shortLabel="Nueva" onClick={() => router.push('/cnt/cuentas/nuevo')} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por número o descripción..." />
        </div>
        <DataTable
          isLoading={isLoading} rows={cuentas} getRowKey={(r) => r.ctac_clave} columns={COLUMNS}
          onEdit={(r) => router.push(`/cnt/cuentas/${r.ctac_clave}`)}
          onDelete={(r) => deleteMut.mutate(r.ctac_clave)}
          deleteConfirmMessage="¿Eliminar esta cuenta?"
          tableClassName="w-full text-sm min-w-[500px]"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
        />
        {pagination && (
          <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
        )}
      </div>
    </div>
  );
}
