'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getProveedores, deleteProveedor } from '@/services/fin';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

export default function ProveedoresPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['proveedores', { page, limit, search: debouncedSearch }],
    queryFn: () => getProveedores({ page, limit, search: debouncedSearch }),
  });

  const proveedores = data?.data ?? [];
  const pagination  = data?.pagination;

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
          columns={[
            { key: 'cod',    header: 'Cód.', headerClassName: 'w-20', cell: (p) => p.prov_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
            { key: 'nom',    header: 'Razón social', cell: (p) => p.prov_razon_social, cellClassName: 'font-medium text-gray-800' },
            { key: 'ruc',    header: 'RUC', headerClassName: 'hidden sm:table-cell', cell: (p) => p.prov_ruc ?? '—', cellClassName: 'text-gray-500 hidden sm:table-cell' },
            { key: 'tel',    header: 'Teléfono', headerClassName: 'hidden md:table-cell', cell: (p) => p.prov_tel ?? '—', cellClassName: 'text-gray-500 hidden md:table-cell' },
            { key: 'tipo',   header: 'Tipo', headerClassName: 'hidden lg:table-cell', cell: (p) => p.tipr_desc ?? '—', cellClassName: 'text-gray-500 hidden lg:table-cell' },
            {
              key: 'estado', header: 'Estado',
              cell: (p) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${p.prov_est_prov === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.prov_est_prov === 'A' ? 'Activo' : 'Inactivo'}
                </span>
              ),
            },
          ]}
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
