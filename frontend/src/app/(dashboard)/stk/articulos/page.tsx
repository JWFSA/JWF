'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import { getArticulos } from '@/services/stk';

export default function ArticulosPage() {
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

  const articulos = data?.data ?? [];
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 hidden md:table-cell">Abrev.</th>
                <th className="px-4 py-3 hidden md:table-cell">UM</th>
                <th className="px-4 py-3 hidden lg:table-cell">Línea</th>
                <th className="px-4 py-3 hidden lg:table-cell">Marca</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : articulos.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Sin resultados</td></tr>
              ) : articulos.map((a) => (
                <tr key={a.art_codigo} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.art_codigo}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{a.art_desc}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{a.art_desc_abrev ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{a.art_unid_med ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{a.lin_desc ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{a.marc_desc ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      a.art_est === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {a.art_est === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/stk/articulos/${a.art_codigo}`} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 text-xs font-medium">
                      <Pencil size={13} /> Editar
                    </Link>
                  </td>
                </tr>
              ))}
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
