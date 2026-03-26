'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getClientes, deleteCliente } from '@/services/fac';
import type { Cliente } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'codigo', header: 'Cód.',    sortKey: 'cod',    headerClassName: 'w-20', cell: (c: Cliente) => c.cli_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'nom',    header: 'Nombre',  sortKey: 'nom',    cell: (c: Cliente) => c.cli_nom, cellClassName: 'font-medium text-gray-800' },
  { key: 'ruc',    header: 'RUC',     sortKey: 'ruc',    headerClassName: 'hidden sm:table-cell', cell: (c: Cliente) => c.cli_ruc ?? '—', cellClassName: 'text-gray-500 hidden sm:table-cell' },
  { key: 'tel',    header: 'Teléfono', sortKey: 'tel',   headerClassName: 'hidden md:table-cell', cell: (c: Cliente) => c.cli_tel ?? '—', cellClassName: 'text-gray-500 hidden md:table-cell' },
  { key: 'zona',   header: 'Zona',    sortKey: 'zona',   headerClassName: 'hidden lg:table-cell', cell: (c: Cliente) => c.zona_desc ?? '—', cellClassName: 'text-gray-500 hidden lg:table-cell' },
  { key: 'estado', header: 'Estado',  sortKey: 'estado',
    cell: (c: Cliente) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${c.cli_est_cli === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {c.cli_est_cli === 'A' ? 'Activo' : 'Inactivo'}
      </span>
    ) },
];

export default function ClientesPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['clientes', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getClientes({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const clientes  = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteCliente,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cartera de clientes</p>
        </div>
        <PrimaryAddButton label="Nuevo cliente" shortLabel="Nuevo" href="/fac/clientes/nuevo" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre, RUC o teléfono..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={clientes}
          getRowKey={(c) => c.cli_codigo}
          onEdit={(c) => router.push(`/fac/clientes/${c.cli_codigo}`)}
          onDelete={(c) => deleteMut.mutate(c.cli_codigo)}
          deleteConfirmMessage="¿Eliminar este cliente?"
          tableClassName="w-full min-w-[600px] text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />

        {pagination && (
          <TablePagination
            total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
}
