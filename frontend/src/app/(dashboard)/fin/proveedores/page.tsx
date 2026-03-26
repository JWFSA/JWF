'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getProveedores, deleteProveedor } from '@/services/fin';
import type { Proveedor } from '@/types/fin';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'cod',    header: 'Cód.',        sortKey: 'cod',    headerClassName: 'w-20', cell: (p: Proveedor) => p.prov_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'nom',    header: 'Razón social', sortKey: 'nom',   cell: (p: Proveedor) => p.prov_razon_social, cellClassName: 'font-medium text-gray-800' },
  { key: 'ruc',    header: 'RUC',         sortKey: 'ruc',    headerClassName: 'hidden sm:table-cell', cell: (p: Proveedor) => p.prov_ruc ?? '—', cellClassName: 'text-gray-500 hidden sm:table-cell' },
  { key: 'tel',    header: 'Teléfono',    sortKey: 'tel',    headerClassName: 'hidden md:table-cell', cell: (p: Proveedor) => p.prov_tel ?? '—', cellClassName: 'text-gray-500 hidden md:table-cell' },
  { key: 'tipo',   header: 'Tipo',        sortKey: 'tipo',   headerClassName: 'hidden lg:table-cell', cell: (p: Proveedor) => p.tipr_desc ?? '—', cellClassName: 'text-gray-500 hidden lg:table-cell' },
  { key: 'estado', header: 'Estado',      sortKey: 'estado',
    cell: (p: Proveedor) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${p.prov_est_prov === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {p.prov_est_prov === 'A' ? 'Activo' : 'Inactivo'}
      </span>
    ) },
];

export default function ProveedoresPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('nom');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['proveedores', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getProveedores({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const proveedores = data?.data ?? [];
  const pagination  = data?.pagination;

  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteProveedor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Proveedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cartera de proveedores</p>
        </div>
        <PrimaryAddButton label="Nuevo proveedor" shortLabel="Nuevo" href="/fin/proveedores/nuevo" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre, RUC o teléfono..." />
        </div>
        <DataTable
          isLoading={isLoading}
          rows={proveedores}
          getRowKey={(p) => p.prov_codigo}
          onEdit={(p) => router.push(`/fin/proveedores/${p.prov_codigo}`)}
          onDelete={(p) => deleteMut.mutate(p.prov_codigo)}
          deleteConfirmMessage="¿Eliminar este proveedor?"
          tableClassName="w-full min-w-[560px] text-sm"
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
