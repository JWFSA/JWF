'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getOperadores } from '@/services/gen';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import DataTable from '@/components/ui/DataTable';
import type { Operador } from '@/types/gen';
import { useState, useEffect } from 'react';

const COLUMNS = [
  { key: 'codigo',  header: 'Cód.',    sortKey: 'cod',   headerClassName: 'w-16', cell: (op: Operador) => op.oper_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'nombre',  header: 'Nombre',  sortKey: 'nom',   cell: (op: Operador) => `${op.oper_nombre} ${op.oper_apellido || ''}`.trim(), cellClassName: 'font-medium text-gray-800' },
  { key: 'login',   header: 'Login',   sortKey: 'login', cell: (op: Operador) => op.oper_login, cellClassName: 'text-gray-600' },
  { key: 'email',   header: 'Email',   headerClassName: 'hidden md:table-cell', cell: (op: Operador) => op.oper_email || '-', cellClassName: 'text-gray-500 hidden md:table-cell' },
  { key: 'empresa', header: 'Empresa', sortKey: 'empr',  headerClassName: 'hidden lg:table-cell', cell: (op: Operador) => op.empr_razon_social || '-', cellClassName: 'text-gray-500 hidden lg:table-cell' },
  { key: 'admin',   header: 'Admin',
    cell: (op: Operador) => op.oper_ind_admin === 'S'
      ? <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">Sí</span>
      : <span className="text-gray-400 text-xs">No</span> },
  { key: 'estado',  header: 'Estado',
    cell: (op: Operador) => op.oper_ind_desc === 'N'
      ? <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Activo</span>
      : <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Inactivo</span> },
];

export default function OperadoresPage() {
  const router = useRouter();
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
    queryKey: ['operadores', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getOperadores({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const rows       = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Operadores</h1>
          <p className="text-sm text-gray-500">Gestión de usuarios del sistema</p>
        </div>
        <PrimaryAddButton label="Nuevo operador" shortLabel="Nuevo" href="/gen/operadores/nuevo" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar operador..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={rows}
          getRowKey={(op) => op.oper_codigo}
          onEdit={(op) => router.push(`/gen/operadores/${op.oper_codigo}`)}
          tableClassName="w-full text-sm min-w-[600px]"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
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
