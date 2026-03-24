'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmpresas } from '@/services/gen';
import { Building2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Empresas</h1>
        <p className="text-sm text-gray-500">Empresas registradas en el sistema</p>
      </div>

      <div className="mb-4">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>{pagination.total} empresas</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
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
  );
}
