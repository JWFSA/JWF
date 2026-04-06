'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCotizaciones, createCotizacion, updateCotizacion, deleteCotizacion } from '@/services/stk';
import { getMonedas } from '@/services/gen';
import { formatDate } from '@/lib/utils';
import type { Cotizacion } from '@/types/stk';
import DataTable from '@/components/ui/DataTable';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { Plus, X } from 'lucide-react';

const fmtTasa = (n?: number | null) => n != null ? Number(n).toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '—';

export default function CotizacionesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Form nueva cotización
  const [showForm, setShowForm] = useState(false);
  const [newFec, setNewFec] = useState(new Date().toISOString().split('T')[0]);
  const [newMon, setNewMon] = useState(2);
  const [newTasa, setNewTasa] = useState('');
  const [newTasaCom, setNewTasaCom] = useState('');
  const [formError, setFormError] = useState('');

  // Edición inline
  const [editing, setEditing] = useState<string | null>(null);
  const [editTasa, setEditTasa] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['cotizaciones', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getCotizaciones({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const { data: monedasArr } = useQuery({
    queryKey: ['monedas'],
    queryFn: getMonedas,
  });
  const monedas = (monedasArr ?? []).filter((m) => m.mon_codigo !== 1); // Excluir moneda local

  const cotizaciones = data?.data ?? [];
  const pagination   = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const createMut = useMutation({
    mutationFn: createCotizacion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cotizaciones'] });
      setShowForm(false);
      setNewTasa('');
      setNewTasaCom('');
      setFormError('');
    },
    onError: (e: any) => setFormError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const updateMut = useMutation({
    mutationFn: ({ fec, mon, data }: { fec: string; mon: number; data: Partial<Cotizacion> }) =>
      updateCotizacion(fec, mon, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cotizaciones'] });
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: ({ fec, mon }: { fec: string; mon: number }) => deleteCotizacion(fec, mon),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cotizaciones'] }),
  });

  const startEdit = (c: Cotizacion) => {
    const key = `${c.cot_fec}-${c.cot_mon}`;
    setEditing(key);
    setEditTasa(String(c.cot_tasa));
  };

  const saveEdit = (c: Cotizacion) => {
    updateMut.mutate({ fec: c.cot_fec, mon: c.cot_mon, data: { cot_tasa: Number(editTasa) } });
  };

  const COLUMNS = [
    { key: 'fecha', header: 'Fecha', sortKey: 'fecha', headerClassName: 'w-32',
      cell: (c: Cotizacion) => formatDate(c.cot_fec), cellClassName: 'text-gray-600' },
    { key: 'moneda', header: 'Moneda', sortKey: 'moneda',
      cell: (c: Cotizacion) => (
        <span>{c.mon_desc ?? `Mon. ${c.cot_mon}`} {c.mon_simbolo && <span className="text-gray-400 text-xs ml-1">({c.mon_simbolo})</span>}</span>
      ), cellClassName: 'font-medium text-gray-800' },
    { key: 'tasa', header: 'Tasa venta', sortKey: 'tasa', headerClassName: 'text-right w-36',
      cell: (c: Cotizacion) => {
        const key = `${c.cot_fec}-${c.cot_mon}`;
        if (editing === key) {
          return (
            <div className="flex items-center gap-1 justify-end">
              <input type="number" step="0.0001" value={editTasa}
                onChange={(e) => setEditTasa(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(c); if (e.key === 'Escape') setEditing(null); }}
                className="w-28 border border-primary-300 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-500"
                autoFocus />
              <button onClick={() => saveEdit(c)} className="text-green-600 text-xs font-medium hover:underline">OK</button>
              <button onClick={() => setEditing(null)} className="text-gray-400 text-xs hover:underline">Esc</button>
            </div>
          );
        }
        return <span className="cursor-pointer hover:text-primary-600" onClick={() => startEdit(c)}>{fmtTasa(c.cot_tasa)}</span>;
      }, cellClassName: 'text-right tabular-nums' },
    { key: 'tasa_com', header: 'Tasa compra', headerClassName: 'text-right w-36 hidden md:table-cell',
      cell: (c: Cotizacion) => fmtTasa(c.cot_tasa_com), cellClassName: 'text-right tabular-nums text-gray-400 hidden md:table-cell' },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Cotizaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tasas de cambio históricas</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton filename="cotizaciones" fetchData={() => getCotizaciones({ all: true })} columns={[
            { header: 'Fecha', value: (r) => r.cot_fec },
            { header: 'Moneda', value: (r) => r.mon_desc },
            { header: 'Tasa venta', value: (r) => r.cot_tasa },
            { header: 'Tasa compra', value: (r) => r.cot_tasa_com },
          ]} />
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cerrar' : 'Nueva cotización'}
          </button>
        </div>
      </div>

      {/* Form nueva cotización */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Nueva cotización</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" value={newFec} onChange={(e) => setNewFec(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
              <select value={newMon} onChange={(e) => setNewMon(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {monedas.map((m) => (
                  <option key={m.mon_codigo} value={m.mon_codigo}>{m.mon_desc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa venta</label>
              <input type="number" step="0.0001" value={newTasa} onChange={(e) => setNewTasa(e.target.value)}
                placeholder="Ej: 7500.0000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa compra <span className="text-gray-400">(opc.)</span></label>
              <input type="number" step="0.0001" value={newTasaCom} onChange={(e) => setNewTasaCom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
          <div className="mt-3 flex justify-end">
            <button onClick={() => createMut.mutate({ cot_fec: newFec, cot_mon: newMon, cot_tasa: Number(newTasa), cot_tasa_com: newTasaCom ? Number(newTasaCom) : null })}
              disabled={createMut.isPending || !newTasa}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
              {createMut.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por fecha o moneda..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={cotizaciones}
          getRowKey={(c) => `${c.cot_fec}-${c.cot_mon}`}
          onEdit={(c) => startEdit(c)}
          onDelete={(c) => deleteMut.mutate({ fec: c.cot_fec, mon: c.cot_mon })}
          deleteConfirmMessage="¿Eliminar esta cotización?"
          tableClassName="w-full text-sm min-w-[500px]"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
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
