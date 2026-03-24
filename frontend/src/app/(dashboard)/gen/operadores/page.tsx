'use client';

import { useQuery } from '@tanstack/react-query';
import { getOperadores } from '@/services/gen';
import { Plus, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
        <Link
          href="/gen/operadores/nuevo"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nuevo operador</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar operador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>{pagination.total} registros</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Primera página">
                  <ChevronsLeft size={16} />
                </button>
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Página anterior">
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2">Página {page} de {pagination.totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page === pagination.totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Página siguiente">
                  <ChevronRight size={16} />
                </button>
                <button onClick={() => setPage(pagination.totalPages)} disabled={page === pagination.totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" title="Última página">
                  <ChevronsRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
