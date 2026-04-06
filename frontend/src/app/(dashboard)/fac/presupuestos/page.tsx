'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getPresupuestos, deletePresupuesto, convertirPresupuesto } from '@/services/fac';
import { formatDate } from '@/lib/utils';
import type { Pedido } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { ArrowRightLeft } from 'lucide-react';

const ESTADO: Record<string, { label: string; cls: string }> = {
  P: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-700' },
  A: { label: 'Aprobado',  cls: 'bg-green-100 text-green-700'  },
  C: { label: 'Cerrado',   cls: 'bg-gray-100 text-gray-500'   },
};

const fmtTotal = (n?: number) =>
  n != null ? new Intl.NumberFormat('es-PY').format(Number(n)) : '—';

const COLUMNS = [
  { key: 'nro',    header: 'Nro.',     sortKey: 'nro',     headerClassName: 'w-28', cell: (p: Pedido) => p.ped_nro, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'fecha',  header: 'Fecha',    sortKey: 'fecha',   headerClassName: 'w-36', cell: (p: Pedido) => formatDate(p.ped_fecha), cellClassName: 'text-gray-600' },
  { key: 'cli',    header: 'Cliente',  sortKey: 'cliente', cell: (p: Pedido) => p.cli_nom ?? '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'vend',   header: 'Vendedor', headerClassName: 'hidden md:table-cell',
    cell: (p: Pedido) => p.vend_nombre ? `${p.vend_nombre} ${p.vend_apellido ?? ''}`.trim() : '—',
    cellClassName: 'text-gray-500 hidden md:table-cell' },
  { key: 'total',  header: 'Total',    sortKey: 'total',   headerClassName: 'hidden sm:table-cell text-right',
    cell: (p: Pedido) => fmtTotal(p.ped_imp_total_mon),
    cellClassName: 'text-right tabular-nums text-gray-700 hidden sm:table-cell' },
  { key: 'estado', header: 'Estado',   sortKey: 'estado',
    cell: (p: Pedido) => {
      const e = ESTADO[p.ped_estado] ?? { label: p.ped_estado, cls: 'bg-gray-100 text-gray-500' };
      return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${e.cls}`}>{e.label}</span>;
    } },
];

export default function PresupuestosPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['presupuestos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getPresupuestos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const presupuestos = data?.data ?? [];
  const pagination   = data?.pagination;

  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const deleteMut = useMutation({
    mutationFn: deletePresupuesto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presupuestos'] }),
  });

  const convertirMut = useMutation({
    mutationFn: convertirPresupuesto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuestos'] });
      qc.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Presupuestos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cotizaciones y propuestas de venta</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton filename="presupuestos" fetchData={() => getPresupuestos({ all: true })} columns={[
            { header: 'Nro.', value: (r) => r.ped_nro },
            { header: 'Fecha', value: (r) => r.ped_fecha },
            { header: 'Cliente', value: (r) => r.cli_nom },
            { header: 'Estado', value: (r) => r.ped_estado },
            { header: 'Total', value: (r) => r.ped_imp_total_mon },
          ]} />
          <PrimaryAddButton label="Nuevo presupuesto" shortLabel="Nuevo" href="/fac/presupuestos/nuevo" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por cliente, nro. o producto..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={presupuestos}
          getRowKey={(p) => p.ped_clave}
          onEdit={(p) => router.push(`/fac/presupuestos/${p.ped_clave}`)}
          onDelete={(p) => deleteMut.mutate(p.ped_clave)}
          deleteConfirmMessage="¿Eliminar este presupuesto?"
          tableClassName="w-full min-w-[700px] text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
          extraActions={(p) => (
            <button
              type="button"
              title="Convertir a pedido"
              onClick={() => {
                if (confirm('¿Convertir este presupuesto en pedido de venta?')) {
                  convertirMut.mutate(p.ped_clave);
                }
              }}
              className="p-1 text-gray-400 hover:text-primary-600 rounded transition"
            >
              <ArrowRightLeft size={14} />
            </button>
          )}
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
