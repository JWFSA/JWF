'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getRemisiones, deleteRemision } from '@/services/stk';
import { formatDate } from '@/lib/utils';
import type { Remision } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'nro',    header: 'Nro.',    sortKey: 'nro',    headerClassName: 'w-36',                    cell: (r: Remision) => r.rem_nro,                                          cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',  header: 'Fecha',   sortKey: 'fecha',  headerClassName: 'w-28',                    cell: (r: Remision) => formatDate(r.rem_fec_emis), cellClassName: 'text-xs text-gray-600' },
  { key: 'cli',    header: 'Cliente', sortKey: 'cliente',                                             cell: (r: Remision) => r.cli_nom ?? '—',                                   cellClassName: 'font-medium text-gray-800' },
  { key: 'dep',    header: 'Depósito',                   headerClassName: 'hidden sm:table-cell w-28', cell: (r: Remision) => r.dep_desc ?? '—',                                cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'timb',   header: 'Timbrado',                   headerClassName: 'hidden md:table-cell w-36', cell: (r: Remision) => r.rem_nro_timbrado ?? '—',                        cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'obs',    header: 'Obs.',                       headerClassName: 'hidden lg:table-cell',      cell: (r: Remision) => r.rem_obs ?? '—',                                 cellClassName: 'hidden lg:table-cell text-xs text-gray-400 truncate max-w-[160px]' },
];

export default function RemisionesPage() {
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
    queryKey: ['remisiones', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getRemisiones({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const remisiones = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteRemision,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['remisiones'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Remisiones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Documentos de remisión de mercaderías</p>
        </div>
        <PrimaryAddButton label="Nueva remisión" shortLabel="Nueva" onClick={() => router.push('/stk/remisiones/nuevo')} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por cliente, nro. o timbrado..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={remisiones}
          getRowKey={(r) => r.rem_nro}
          onEdit={(r) => router.push(`/stk/remisiones/${r.rem_nro}`)}
          onDelete={(r) => deleteMut.mutate(r.rem_nro)}
          deleteConfirmMessage="¿Eliminar esta remisión?"
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
