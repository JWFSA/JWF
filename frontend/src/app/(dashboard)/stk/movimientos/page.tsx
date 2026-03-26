'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getMovimientos, deleteMovimiento } from '@/services/stk';
import type { Movimiento } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const ENT_SAL: Record<string, string> = { E: 'Entrada', S: 'Salida' };

const COLUMNS = [
  { key: 'nro',   header: 'Nro.',          sortKey: 'nro',   headerClassName: 'w-20',                   cell: (r: Movimiento) => r.docu_nro_doc,                           cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha', header: 'Fecha',          sortKey: 'fecha', headerClassName: 'w-28',                   cell: (r: Movimiento) => r.docu_fec_emis?.toString().substring(0, 10) ?? '—', cellClassName: 'text-gray-600 text-xs' },
  { key: 'oper',  header: 'Operación',      sortKey: 'oper',                                             cell: (r: Movimiento) => r.oper_desc ?? '—',                       cellClassName: 'font-medium text-gray-800' },
  { key: 'tipo',  header: 'Tipo',                             headerClassName: 'hidden sm:table-cell w-20', cell: (r: Movimiento) => r.oper_ent_sal ? ENT_SAL[r.oper_ent_sal] ?? '—' : '—', cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'dep',   header: 'Depósito orig.', sortKey: 'dep',   headerClassName: 'hidden md:table-cell',   cell: (r: Movimiento) => r.dep_orig_desc ?? '—',                   cellClassName: 'hidden md:table-cell text-gray-500' },
  { key: 'obs',   header: 'Observaciones',                    headerClassName: 'hidden lg:table-cell',   cell: (r: Movimiento) => r.docu_obs ?? '—',                        cellClassName: 'hidden lg:table-cell text-gray-400 text-xs truncate max-w-[160px]' },
];

export default function MovimientosPage() {
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
    queryKey: ['movimientos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getMovimientos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const movimientos = data?.data ?? [];
  const pagination  = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteMovimiento,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['movimientos'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Movimientos de stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">Entradas y salidas de inventario</p>
        </div>
        <PrimaryAddButton label="Nuevo movimiento" shortLabel="Nuevo" onClick={() => router.push('/stk/movimientos/nuevo')} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por operación, nro. o descripción..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={movimientos}
          getRowKey={(r) => r.docu_clave}
          onEdit={(r) => router.push(`/stk/movimientos/${r.docu_clave}`)}
          onDelete={(r) => deleteMut.mutate(r.docu_clave)}
          deleteConfirmMessage="¿Eliminar este movimiento de stock?"
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
