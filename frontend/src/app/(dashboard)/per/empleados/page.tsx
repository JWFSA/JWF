'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getEmpleados, deleteEmpleado } from '@/services/per';
import type { Empleado } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const SITUACIONES: Record<string, string> = { A: 'Activo', I: 'Inactivo' };

const COLUMNS = [
  { key: 'legajo',  header: 'Legajo',    sortKey: 'legajo', headerClassName: 'w-20',                     cell: (r: Empleado) => r.empl_legajo,                                               cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'nombre',  header: 'Nombre',    sortKey: 'nombre',                                               cell: (r: Empleado) => `${r.empl_nombre ?? ''} ${r.empl_ape ?? ''}`.trim() || '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'ci',      header: 'C.I.',                          headerClassName: 'hidden sm:table-cell w-28', cell: (r: Empleado) => r.empl_doc_ident ?? '—',                                     cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'cargo',   header: 'Cargo',                         headerClassName: 'hidden md:table-cell',      cell: (r: Empleado) => r.car_desc ?? '—',                                           cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'ingreso', header: 'Ingreso',   sortKey: 'ingreso', headerClassName: 'hidden md:table-cell w-28', cell: (r: Empleado) => r.empl_fec_ingreso?.toString().substring(0, 10) ?? '—',     cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'sit',     header: 'Situación',                     headerClassName: 'hidden lg:table-cell w-24',
    cell: (r: Empleado) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.empl_situacion === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {r.empl_situacion ? (SITUACIONES[r.empl_situacion] ?? r.empl_situacion) : '—'}
      </span>
    ),
    cellClassName: 'hidden lg:table-cell',
  },
];

export default function EmpleadosPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('legajo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['empleados', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getEmpleados({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const empleados  = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteEmpleado,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['empleados'] }),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Empleados</h1>
          <p className="text-sm text-gray-500 mt-0.5">Nómina del personal</p>
        </div>
        <PrimaryAddButton label="Nuevo empleado" shortLabel="Nuevo" onClick={() => router.push('/per/empleados/nuevo')} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre, apellido o C.I..." />
        </div>
        <DataTable
          key={`${page}-${limit}-${debouncedSearch}-${sortField}-${sortDir}`}
          isLoading={isLoading || isFetching}
          rows={empleados}
          getRowKey={(r) => r.empl_legajo}
          onEdit={(r) => router.push(`/per/empleados/${r.empl_legajo}`)}
          onDelete={(r) => deleteMut.mutate(r.empl_legajo)}
          deleteConfirmMessage="¿Eliminar este empleado?"
          tableClassName="w-full text-sm min-w-[500px]"
          sortField={sortField}
          sortDir={sortDir}
          onSortChange={handleSortChange}
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
