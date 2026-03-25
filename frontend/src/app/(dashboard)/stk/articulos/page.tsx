'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import DataTable from '@/components/ui/DataTable';
import { getArticulos } from '@/services/stk';

export default function ArticulosPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['articulos', { page, limit, search: debouncedSearch }],
    queryFn: () => getArticulos({ page, limit, search: debouncedSearch }),
  });

  const articulos  = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Artículos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catálogo de artículos y productos</p>
        </div>
        <PrimaryAddButton label="Nuevo artículo" shortLabel="Nuevo" href="/stk/articulos/nuevo" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar artículos..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={articulos}
          getRowKey={(a) => a.art_codigo}
          onEdit={(a) => router.push(`/stk/articulos/${a.art_codigo}`)}
          tableClassName="w-full min-w-[700px] text-sm"
          columns={[
            { key: 'codigo', header: 'Código', headerClassName: 'w-24', cell: (a) => a.art_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
            { key: 'desc', header: 'Descripción', cell: (a) => a.art_desc, cellClassName: 'font-medium text-gray-800' },
            { key: 'abrev', header: 'Abrev.', headerClassName: 'hidden md:table-cell', cell: (a) => a.art_desc_abrev ?? '—', cellClassName: 'text-gray-500 hidden md:table-cell' },
            { key: 'um', header: 'UM', headerClassName: 'hidden md:table-cell', cell: (a) => a.art_unid_med ?? '—', cellClassName: 'text-gray-500 hidden md:table-cell' },
            { key: 'linea', header: 'Línea', headerClassName: 'hidden lg:table-cell', cell: (a) => a.lin_desc ?? '—', cellClassName: 'text-gray-500 hidden lg:table-cell' },
            { key: 'marca', header: 'Marca', headerClassName: 'hidden lg:table-cell', cell: (a) => a.marc_desc ?? '—', cellClassName: 'text-gray-500 hidden lg:table-cell' },
            {
              key: 'estado',
              header: 'Estado',
              cell: (a) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  a.art_est === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {a.art_est === 'A' ? 'Activo' : 'Inactivo'}
                </span>
              ),
            },
          ]}
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
