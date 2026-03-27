'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContratos, createContrato, updateContrato, deleteContrato, getEmpleados, getTiposContrato } from '@/services/per';
import { formatDate, toInputDate } from '@/lib/utils';
import type { Contrato } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const COLUMNS = [
  { key: 'cod',    header: 'Cód.',       headerClassName: 'w-16',                      cell: (r: Contrato) => r.con_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'empl',   header: 'Empleado',   sortKey: 'empleado',                          cell: (r: Contrato) => `${r.empl_nombre ?? ''} ${r.empl_ape ?? ''}`.trim() || '—', cellClassName: 'font-medium text-gray-800' },
  { key: 'tipo',   header: 'Tipo',       headerClassName: 'hidden sm:table-cell',      cell: (r: Contrato) => r.tipcon_descripcion || '—', cellClassName: 'hidden sm:table-cell text-sm text-gray-500' },
  { key: 'inicio', header: 'Inicio',     sortKey: 'fecha', headerClassName: 'hidden sm:table-cell w-28', cell: (r: Contrato) => formatDate(r.con_fecha_ini), cellClassName: 'hidden sm:table-cell text-sm text-gray-500' },
  { key: 'fin',    header: 'Fin',        headerClassName: 'hidden md:table-cell w-28', cell: (r: Contrato) => r.con_fecha_fin ? formatDate(r.con_fecha_fin) : 'Indefinido', cellClassName: 'hidden md:table-cell text-sm text-gray-500' },
];

export default function ContratosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Contrato | null>(null);
  const [form, setForm] = useState({ con_empleado: '', con_tipo_contrato: '', con_fecha_ini: '', con_fecha_fin: '', con_observacion: '', con_dias_preaviso: '', con_mov_propia: 'N' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['contratos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getContratos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const { data: emplData } = useQuery({ queryKey: ['empleados', { all: true }], queryFn: () => getEmpleados({ all: true }) });
  const empleados = emplData?.data ?? [];

  const { data: tiposData } = useQuery({ queryKey: ['tipos-contrato', { all: true }], queryFn: () => getTiposContrato({ all: true }) });
  const tiposContrato = tiposData?.data ?? [];

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['contratos'] });

  const createMut = useMutation({ mutationFn: createContrato, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Contrato> }) => updateContrato(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteContrato, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ con_empleado: '', con_tipo_contrato: '', con_fecha_ini: '', con_fecha_fin: '', con_observacion: '', con_dias_preaviso: '', con_mov_propia: 'N' }); setError(''); setModal(true); };
  const openEdit = (r: Contrato) => {
    setEditing(r);
    setForm({
      con_empleado: r.con_empleado?.toString() ?? '',
      con_tipo_contrato: r.con_tipo_contrato?.toString() ?? '',
      con_fecha_ini: toInputDate(r.con_fecha_ini) ?? '',
      con_fecha_fin: toInputDate(r.con_fecha_fin) ?? '',
      con_observacion: r.con_observacion ?? '',
      con_dias_preaviso: r.con_dias_preaviso?.toString() ?? '',
      con_mov_propia: r.con_mov_propia ?? 'N',
    });
    setError(''); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.con_empleado || !form.con_fecha_ini) { setError('Empleado y fecha inicio son requeridos'); return; }
    const payload = {
      con_empleado: Number(form.con_empleado),
      con_tipo_contrato: form.con_tipo_contrato ? Number(form.con_tipo_contrato) : null,
      con_fecha_ini: form.con_fecha_ini,
      con_fecha_fin: form.con_fecha_fin || null,
      con_observacion: form.con_observacion || null,
      con_dias_preaviso: form.con_dias_preaviso ? Number(form.con_dias_preaviso) : null,
      con_mov_propia: form.con_mov_propia,
    };
    if (editing) updateMut.mutate({ id: editing.con_codigo, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Contratos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Contratos laborales del personal</p>
        </div>
        <PrimaryAddButton label="Nuevo contrato" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por observación o empleado..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.con_codigo}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.con_codigo)}
          deleteConfirmMessage="¿Eliminar este contrato?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar contrato' : 'Nuevo contrato'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empleado <span className="text-red-500">*</span></label>
              <select value={form.con_empleado} onChange={(e) => setForm((f) => ({ ...f, con_empleado: e.target.value }))} disabled={!!editing} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50">
                <option value="">— Seleccionar empleado —</option>
                {empleados.map((e: any) => <option key={e.empl_legajo} value={e.empl_legajo}>{e.empl_legajo} - {e.empl_nombre} {e.empl_ape ?? ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contrato</label>
              <select value={form.con_tipo_contrato} onChange={(e) => setForm((f) => ({ ...f, con_tipo_contrato: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">— Sin tipo —</option>
                {tiposContrato.map((t: any) => <option key={t.tipcon_codigo} value={t.tipcon_codigo}>{t.tipcon_descripcion}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio <span className="text-red-500">*</span></label>
                <input type="date" value={form.con_fecha_ini} onChange={(e) => setForm((f) => ({ ...f, con_fecha_ini: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input type="date" value={form.con_fecha_fin} onChange={(e) => setForm((f) => ({ ...f, con_fecha_fin: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días preaviso</label>
                <input type="number" value={form.con_dias_preaviso} onChange={(e) => setForm((f) => ({ ...f, con_dias_preaviso: e.target.value }))} placeholder="Ej: 30" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.con_mov_propia === 'S'} onChange={(e) => setForm((f) => ({ ...f, con_mov_propia: e.target.checked ? 'S' : 'N' }))} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">Movilidad propia</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
              <textarea value={form.con_observacion} onChange={(e) => setForm((f) => ({ ...f, con_observacion: e.target.value }))} rows={2} placeholder="Observaciones del contrato..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
