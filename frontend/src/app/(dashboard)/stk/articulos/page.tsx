'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import DataTable from '@/components/ui/DataTable';
import ExportButton from '@/components/ui/ExportButton';
import { getArticulos, deleteArticulo, getLineas, getMarcas, getRubros } from '@/services/stk';
import type { Articulo } from '@/types/stk';
import { useFilters } from '@/stores/useFilterStore';
import { Filter, X } from 'lucide-react';

const PAGE_ID = 'articulos';
const DEFAULTS = { linea: '', marca: '', rubro: '', estado: '', search: '' };

const COLUMNS = [
  { key: 'codigo', header: 'Código',      sortKey: 'cod',   headerClassName: 'w-24',                cell: (a: Articulo) => a.art_codigo,        cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',   header: 'Descripción', sortKey: 'desc',                                           cell: (a: Articulo) => a.art_desc,          cellClassName: 'font-medium text-gray-800' },
  { key: 'abrev',  header: 'Abrev.',                        headerClassName: 'hidden md:table-cell', cell: (a: Articulo) => a.art_desc_abrev ?? '—', cellClassName: 'text-gray-500 hidden md:table-cell' },
  { key: 'um',     header: 'UM',                            headerClassName: 'hidden md:table-cell', cell: (a: Articulo) => a.art_unid_med ?? '—',   cellClassName: 'text-gray-500 hidden md:table-cell' },
  { key: 'linea',  header: 'Línea',       sortKey: 'linea', headerClassName: 'hidden lg:table-cell', cell: (a: Articulo) => a.lin_desc ?? '—',   cellClassName: 'text-gray-500 hidden lg:table-cell' },
  { key: 'marca',  header: 'Marca',       sortKey: 'marca', headerClassName: 'hidden lg:table-cell', cell: (a: Articulo) => a.marc_desc ?? '—',  cellClassName: 'text-gray-500 hidden lg:table-cell' },
  {
    key: 'estado', header: 'Estado', sortKey: 'estado',
    cell: (a: Articulo) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${a.art_est === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {a.art_est === 'A' ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
];

export default function ArticulosPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filters, setFilter, clearFilters] = useFilters(PAGE_ID, DEFAULTS);

  const sf = (key: keyof typeof DEFAULTS, value: string) => { setFilter(key, value); setPage(1); };

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const dropdownFilterCount = [filters.linea, filters.marca, filters.rubro, filters.estado].filter(Boolean).length;
  const [showFilters, setShowFilters] = useState(dropdownFilterCount > 0);

  // Search con debounce
  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => {
    const t = setTimeout(() => sf('search', searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // Datos para dropdowns
  const { data: lineasData } = useQuery({ queryKey: ['lineas', { all: true }], queryFn: () => getLineas({ all: true }) });
  const { data: marcasData } = useQuery({ queryKey: ['marcas', { all: true }], queryFn: () => getMarcas({ all: true }) });
  const { data: rubrosData } = useQuery({ queryKey: ['rubros', { all: true }], queryFn: () => getRubros({ all: true }) });
  const lineasList = lineasData?.data ?? [];
  const marcasList = marcasData?.data ?? [];
  const rubrosList = rubrosData?.data ?? [];

  const queryParams: any = { page, limit, search: filters.search, sortField, sortDir };
  if (filters.linea)  queryParams.linea  = filters.linea;
  if (filters.marca)  queryParams.marca  = filters.marca;
  if (filters.rubro)  queryParams.rubro  = filters.rubro;
  if (filters.estado) queryParams.estado = filters.estado;

  const { data, isLoading } = useQuery({
    queryKey: ['articulos', queryParams],
    queryFn: () => getArticulos(queryParams),
  });

  const deleteMut = useMutation({
    mutationFn: deleteArticulo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['articulos'] }),
  });

  const articulos  = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const exportParams: any = { all: true };
  if (filters.linea)  exportParams.linea  = filters.linea;
  if (filters.marca)  exportParams.marca  = filters.marca;
  if (filters.rubro)  exportParams.rubro  = filters.rubro;
  if (filters.estado) exportParams.estado = filters.estado;

  const sel = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Artículos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catálogo de artículos y productos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-2 rounded-lg transition shrink-0 ${dropdownFilterCount > 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
            {dropdownFilterCount > 0 && <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{dropdownFilterCount}</span>}
          </button>
          <ExportButton filename="articulos" fetchData={() => getArticulos(exportParams)} columns={[
            { header: 'Código', value: (r) => r.art_codigo },
            { header: 'Descripción', value: (r) => r.art_desc },
            { header: 'Abreviatura', value: (r) => r.art_desc_abrev },
            { header: 'UM', value: (r) => r.art_unid_med },
            { header: 'Línea', value: (r) => r.lin_desc },
            { header: 'Marca', value: (r) => r.marc_desc },
            { header: 'Rubro', value: (r) => r.rub_desc },
            { header: 'Estado', value: (r) => r.art_est === 'A' ? 'Activo' : 'Inactivo' },
            { header: 'Cód. fábrica', value: (r) => r.art_codigo_fabrica },
          ]} />
          <PrimaryAddButton label="Nuevo artículo" shortLabel="Nuevo" href="/stk/articulos/nuevo" />
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Filtros avanzados</h3>
            {dropdownFilterCount > 0 && (
              <button onClick={() => { clearFilters(); setSearchInput(''); }} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
                <X size={14} /> Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Línea</label>
              <select value={filters.linea} onChange={(e) => sf('linea', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todas</option>
                {lineasList.map((l) => <option key={l.lin_codigo} value={l.lin_codigo}>{l.lin_desc}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Marca</label>
              <select value={filters.marca} onChange={(e) => sf('marca', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todas</option>
                {marcasList.map((m) => <option key={m.marc_codigo} value={m.marc_codigo}>{m.marc_desc}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Rubro</label>
              <select value={filters.rubro} onChange={(e) => sf('rubro', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                {rubrosList.map((r) => <option key={r.rub_codigo} value={r.rub_codigo}>{r.rub_desc}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
              <select value={filters.estado} onChange={(e) => sf('estado', e.target.value)} className={`w-full ${sel}`}>
                <option value="">Todos</option>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={searchInput} onChange={setSearchInput} placeholder="Buscar por descripción o código de fábrica..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={articulos}
          getRowKey={(a) => a.art_codigo}
          onEdit={(a) => router.push(`/stk/articulos/${a.art_codigo}`)}
          onDelete={(a) => deleteMut.mutate(a.art_codigo)}
          deleteConfirmMessage="¿Eliminar este artículo?"
          tableClassName="w-full min-w-[700px] text-sm"
          columns={COLUMNS}
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
        />

        {pagination && (
          <TablePagination
            total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
}
