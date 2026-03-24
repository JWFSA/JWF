'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmpresas } from '@/services/gen';
import { Building2 } from 'lucide-react';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmpresasPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['empresas', { page, limit, search: debouncedSearch }],
    queryFn: () => getEmpresas({ page, limit, search: debouncedSearch }),
  });

  const rows       = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Empresas</h1>
          <p className="text-sm text-gray-500">Empresas registradas en el sistema</p>
        </div>
        <PrimaryAddButton label="Nueva empresa" shortLabel="Nueva" href="/gen/empresas/nuevo" />
      </div>

      <div className="mb-4">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Buscar empresa..."
          inputClassName="bg-white"
        />
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-400 text-sm">Sin resultados</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((emp) => (
            <Link
              key={emp.empr_codigo}
              href={`/gen/empresas/${emp.empr_codigo}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Building2 size={18} className="text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{emp.empr_razon_social}</p>
                  {emp.empr_ruc && <p className="text-xs text-gray-500 mt-0.5">RUC: {emp.empr_ruc}</p>}
                  {emp.empr_localidad && <p className="text-xs text-gray-400">{emp.empr_localidad}</p>}
                  {emp.empr_ind_bloqueado === 'S' && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full mt-1 inline-block">
                      Bloqueada
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination && (
        <TablePagination
          total={pagination.total}
          page={page}
          limit={limit}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          onLimitChange={(n) => { setLimit(n); setPage(1); }}
          countLabel={`${pagination.total} empresas`}
          className="mt-4 !border-t-0"
        />
      )}
    </div>
  );
}
