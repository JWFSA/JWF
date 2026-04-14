'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHorarios } from '@/services/per';
import type { EmplHorario } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'empleado', header: 'Empleado',    sortKey: 'empleado', cell: (r: EmplHorario) => `${r.empl_nombre ?? ''} ${r.empl_ape ?? ''}`.trim() || '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'dia',      header: 'Día',          sortKey: 'dia',      headerClassName: 'w-28', cell: (r: EmplHorario) => r.emplh_dia ?? '—', cellClassName: 'text-gray-600' },
  { key: 'ini',      header: 'Hora inicio',                        headerClassName: 'w-28', cell: (r: EmplHorario) => r.emplh_hora_ini ?? '—', cellClassName: 'text-xs text-gray-500' },
  { key: 'fin',      header: 'Hora fin',                           headerClassName: 'w-28', cell: (r: EmplHorario) => r.emplh_hora_fin ?? '—', cellClassName: 'text-xs text-gray-500' },
];

export default function HorariosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('empleado');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => { const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['per-horarios', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getHorarios({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Horarios de empleados</h1>
        <p className="text-sm text-gray-500 mt-0.5">Horarios asignados por día</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por empleado o día..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => `${r.emplh_legajo}-${r.emplh_item}`} columns={COLUMNS}
          tableClassName="w-full text-sm min-w-[400px]" sortField={sortField} sortDir={sortDir}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); setPage(1); }} />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
    </div>
  );
}
