'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCuentasBancarias, deleteCuentaBancaria } from '@/services/fin';
import type { CuentaBancaria } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const TIPO_LABELS: Record<string, string> = { C: 'Corriente', A: 'Ahorro' };

const COLUMNS = [
  { key: 'cod',   header: 'Cód.',        sortKey: 'cod',   headerClassName: 'w-16',                   cell: (r: CuentaBancaria) => r.cta_codigo,                     cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',  header: 'Descripción', sortKey: 'desc',                                              cell: (r: CuentaBancaria) => r.cta_desc,                       cellClassName: 'font-medium text-gray-800' },
  { key: 'banco', header: 'Banco',       sortKey: 'banco', headerClassName: 'hidden md:table-cell',    cell: (r: CuentaBancaria) => r.bco_desc ?? '—',                cellClassName: 'hidden md:table-cell text-gray-500' },
  { key: 'tipo',  header: 'Tipo',                          headerClassName: 'hidden sm:table-cell w-28', cell: (r: CuentaBancaria) => TIPO_LABELS[r.cta_tipo_cta ?? ''] ?? '—', cellClassName: 'hidden sm:table-cell text-gray-500' },
  { key: 'mon',   header: 'Moneda',                        headerClassName: 'hidden lg:table-cell',    cell: (r: CuentaBancaria) => r.mon_desc ?? '—',                cellClassName: 'hidden lg:table-cell text-gray-500' },
];

export default function CuentasBancariasPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['cuentas-bancarias', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getCuentasBancarias({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const cuentas    = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteCuentaBancaria,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cuentas-bancarias'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Cuentas bancarias</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cuentas bancarias de la empresa</p>
        </div>
        <PrimaryAddButton label="Nueva cuenta" shortLabel="Nueva" onClick={() => router.push('/fin/cuentas-bancarias/nuevo')} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={cuentas} getRowKey={(r) => r.cta_codigo}
          onEdit={(r) => router.push(`/fin/cuentas-bancarias/${r.cta_codigo}`)}
          onDelete={(r) => deleteMut.mutate(r.cta_codigo)}
          deleteConfirmMessage="¿Eliminar esta cuenta bancaria?"
          tableClassName="w-full text-sm min-w-[500px]"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
