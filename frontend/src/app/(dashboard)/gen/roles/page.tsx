'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getRoles, createRol, deleteRol } from '@/services/gen';
import type { Rol } from '@/types/gen';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import { useState, useEffect } from 'react';

const COLUMNS = [
  { key: 'codigo', header: 'Código', sortKey: 'cod', headerClassName: 'w-24', cell: (r: Rol) => r.rol_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'nombre', header: 'Nombre', sortKey: 'nom', cell: (r: Rol) => r.rol_nombre, cellClassName: 'font-medium text-gray-800' },
];

export default function RolesPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('nom');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [nombre, setNombre] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['roles', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getRoles({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const rows       = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const createMutation = useMutation({
    mutationFn: createRol,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      setNombre('');
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRol,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Roles</h1>
          <p className="text-sm text-gray-500">Perfiles de acceso al sistema</p>
        </div>
        <PrimaryAddButton label="Nuevo rol" shortLabel="Nuevo" onClick={() => setShowForm(true)} />
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre del rol</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Vendedor, Administrativo..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => createMutation.mutate({ nombre })}
                disabled={!nombre.trim() || createMutation.isPending}
                className="flex-1 sm:flex-none bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 sm:flex-none text-gray-500 px-4 py-2 rounded-lg text-sm border border-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar rol..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={rows}
          getRowKey={(rol) => rol.rol_codigo}
          onEdit={(rol) => router.push(`/gen/roles/${rol.rol_codigo}`)}
          onDelete={(rol) => deleteMutation.mutate(rol.rol_codigo)}
          deleteConfirmMessage="¿Eliminar este rol?"
          tableClassName="w-full text-sm min-w-[400px]"
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
