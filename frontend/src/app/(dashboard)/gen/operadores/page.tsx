'use client';

import { useQuery } from '@tanstack/react-query';
import { getOperadores } from '@/services/gen';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OperadoresPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['operadores', { page, limit, search: debouncedSearch }],
    queryFn: () => getOperadores({ page, limit, search: debouncedSearch }),
  });

  const rows       = data?.data ?? [];
  const pagination = data?.pagination;

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

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Cód.</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Login</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Empresa</th>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Sin resultados</td></tr>
              ) : (
                rows.map((op) => (
                  <tr key={op.oper_codigo} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500">{op.oper_codigo}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {op.oper_nombre} {op.oper_apellido || ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{op.oper_login}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{op.oper_email || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{op.empr_razon_social || '-'}</td>
                    <td className="px-4 py-3">
                      {op.oper_ind_admin === 'S' ? (
                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">Sí</span>
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {op.oper_ind_desc === 'N' ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Activo</span>
                      ) : (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Inactivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/gen/operadores/${op.oper_codigo}`}
                        className="text-primary-600 hover:underline text-xs"
                      >
                        Ver / Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
