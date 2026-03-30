'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAsientos, deleteAsiento } from '@/services/cnt';
import { formatDate } from '@/lib/utils';
import type { Asiento } from '@/types/cnt';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'nro',       header: 'Nro.',       sortKey: 'nro',       headerClassName: 'w-20',                   cell: (r: Asiento) => r.asi_nro,                 cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',     header: 'Fecha',      sortKey: 'fecha',     headerClassName: 'w-28',                   cell: (r: Asiento) => formatDate(r.asi_fec),     cellClassName: 'text-xs text-gray-600' },
  { key: 'obs',       header: 'Observación',                                                                 cell: (r: Asiento) => r.asi_obs ?? '—',          cellClassName: 'font-medium text-gray-800 truncate max-w-xs' },
  { key: 'ejercicio', header: 'Ejercicio',  sortKey: 'ejercicio', headerClassName: 'hidden sm:table-cell w-20', cell: (r: Asiento) => r.asi_ejercicio,         cellClassName: 'hidden sm:table-cell text-xs text-gray-500 text-center' },
  { key: 'login',     header: 'Usuario',                          headerClassName: 'hidden md:table-cell w-24', cell: (r: Asiento) => r.asi_login ?? '—',      cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
];

export default function AsientosPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['cnt-asientos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getAsientos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const asientos   = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteAsiento,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cnt-asientos'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Asientos contables</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registros contables del libro diario</p>
        </div>
        <PrimaryAddButton label="Nuevo asiento" shortLabel="Nuevo" onClick={() => router.push('/cnt/asientos/nuevo')} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nro u observación..." />
        </div>
        <DataTable isLoading={isLoading} rows={asientos} getRowKey={(r) => r.asi_clave} columns={COLUMNS}
          onEdit={(r) => router.push(`/cnt/asientos/${r.asi_clave}`)}
          onDelete={(r) => deleteMut.mutate(r.asi_clave)}
          deleteConfirmMessage="¿Eliminar este asiento?"
          tableClassName="w-full text-sm min-w-[500px]"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange} />
        {pagination && (
          <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
        )}
      </div>
    </div>
  );
}
