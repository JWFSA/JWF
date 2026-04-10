'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getEmpleados, deleteEmpleado, getCargos, getAreas } from '@/services/per';
import { formatDate } from '@/lib/utils';
import type { Empleado } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { useFilters } from '@/stores/useFilterStore';
import { Filter, X } from 'lucide-react';

const SITUACIONES: Record<string, string> = { A: 'Activo', I: 'Inactivo' };

const COLUMNS = [
  { key: 'legajo',  header: 'Legajo',    sortKey: 'legajo', headerClassName: 'w-20',                     cell: (r: Empleado) => r.empl_legajo,                                               cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'nombre',  header: 'Nombre',    sortKey: 'nombre',                                               cell: (r: Empleado) => `${r.empl_nombre ?? ''} ${r.empl_ape ?? ''}`.trim() || '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'ci',      header: 'C.I.',                          headerClassName: 'hidden sm:table-cell w-28', cell: (r: Empleado) => r.empl_doc_ident ?? '—',                                     cellClassName: 'hidden sm:table-cell text-xs text-gray-500' },
  { key: 'cargo',   header: 'Cargo',                         headerClassName: 'hidden md:table-cell',      cell: (r: Empleado) => r.car_desc ?? '—',                                           cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'ingreso', header: 'Ingreso',   sortKey: 'ingreso', headerClassName: 'hidden md:table-cell w-28', cell: (r: Empleado) => formatDate(r.empl_fec_ingreso),     cellClassName: 'hidden md:table-cell text-xs text-gray-500' },
  { key: 'sit',     header: 'Situación',                     headerClassName: 'hidden lg:table-cell w-24',
    cell: (r: Empleado) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.empl_situacion === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {r.empl_situacion ? (SITUACIONES[r.empl_situacion] ?? r.empl_situacion) : '—'}
      </span>
    ),
    cellClassName: 'hidden lg:table-cell',
  },
];

const PAGE_ID = 'empleados';
const DEFAULTS = { situacion: '', cargo: '', area: '', search: '' };

export default function EmpleadosPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filters, setFilter, clearFilters] = useFilters(PAGE_ID, DEFAULTS);
  const sf = (key: keyof typeof DEFAULTS, value: string) => { setFilter(key, value); setPage(1); };

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('nombre');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const activeFilters = [filters.situacion, filters.cargo, filters.area].filter(Boolean).length;
  const [showFilters, setShowFilters] = useState(activeFilters > 0);

  // Search con debounce
  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => {
    const t = setTimeout(() => sf('search', searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: cargosData } = useQuery({ queryKey: ['cargos', { all: true }], queryFn: () => getCargos({ all: true }) });
  const cargos = cargosData?.data ?? [];
  const { data: areasData } = useQuery({ queryKey: ['areas', { all: true }], queryFn: () => getAreas({ all: true }) });
  const areas = areasData?.data ?? [];

  const queryParams: any = { page, limit, search: filters.search, sortField, sortDir };
  if (filters.situacion) queryParams.situacion = filters.situacion;
  if (filters.cargo) queryParams.cargo = filters.cargo;
  if (filters.area) queryParams.area = filters.area;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['empleados', queryParams],
    queryFn: () => getEmpleados(queryParams),
  });

  const empleados  = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deleteEmpleado,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['empleados'] }),
  });

  const sel = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Empleados</h1>
          <p className="text-sm text-gray-500 mt-0.5">Nómina del personal</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-2 rounded-lg transition shrink-0 ${activeFilters > 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilters > 0 && <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters}</span>}
          </button>
          <ExportButton filename="empleados" fetchData={() => getEmpleados({ all: true })} columns={[
            { header: 'Legajo', value: (r) => r.empl_legajo },
            { header: 'Nombre', value: (r) => r.empl_nombre },
            { header: 'Apellido', value: (r) => r.empl_ape },
            { header: 'Documento', value: (r) => r.empl_doc_ident },
            { header: 'Cargo', value: (r) => r.cargo_desc },
            { header: 'Área', value: (r) => r.area_desc },
            { header: 'Ingreso', value: (r) => r.empl_fec_ingreso },
            { header: 'Salario base', value: (r) => r.empl_salario_base },
          ]} />
          <PrimaryAddButton label="Nuevo empleado" shortLabel="Nuevo" onClick={() => router.push('/per/empleados/nuevo')} />
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Filtros avanzados</h3>
            {activeFilters > 0 && (
              <button onClick={() => { clearFilters(); setSearchInput(''); }} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
                <X size={14} /> Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Situación</label>
              <select value={filters.situacion} onChange={(e) => sf('situacion', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todas</option>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cargo</label>
              <select value={filters.cargo} onChange={(e) => sf('cargo', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                {cargos.map((c) => (
                  <option key={c.car_codigo} value={c.car_codigo}>{c.car_desc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Área</label>
              <select value={filters.area} onChange={(e) => sf('area', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todas</option>
                {areas.map((a) => (
                  <option key={a.per_area_cod} value={a.per_area_cod}>{a.per_area_desc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={searchInput} onChange={setSearchInput} placeholder="Buscar por nombre, apellido o C.I..." />
        </div>
        <DataTable
          key={`${page}-${limit}-${filters.search}-${sortField}-${sortDir}`}
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
