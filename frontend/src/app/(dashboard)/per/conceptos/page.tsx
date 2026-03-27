'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConceptos, createConcepto, updateConcepto, deleteConcepto, getClasificacionesConcepto, getClasificacionesDescuento } from '@/services/per';
import type { Concepto } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const TIPO_CLAS: Record<string, string> = { C: 'Crédito', D: 'Débito', A: 'Aguinaldo' };

const COLUMNS = [
  { key: 'clave', header: 'Clave',        sortKey: 'cod',  headerClassName: 'w-16', cell: (r: Concepto) => r.pcon_clave, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'desc',  header: 'Descripción',  sortKey: 'desc',                           cell: (r: Concepto) => r.pcon_desc, cellClassName: 'font-medium text-gray-800' },
  { key: 'clas',  header: 'Clasificación', sortKey: 'clas', headerClassName: 'hidden sm:table-cell', cell: (r: Concepto) => r.clco_desc || '—', cellClassName: 'hidden sm:table-cell text-sm text-gray-500' },
  { key: 'tipo',  header: 'Tipo',         headerClassName: 'hidden sm:table-cell w-20',
    cell: (r: Concepto) => {
      const t = r.clco_tipo;
      const color = t === 'C' ? 'bg-green-100 text-green-700' : t === 'D' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
      return t ? <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{TIPO_CLAS[t] || t}</span> : '—';
    },
    cellClassName: 'hidden sm:table-cell',
  },
  { key: 'orden', header: 'Orden',        sortKey: 'orden', headerClassName: 'hidden md:table-cell w-16 text-center', cell: (r: Concepto) => r.pcon_orden ?? '—', cellClassName: 'hidden md:table-cell text-center text-xs text-gray-500' },
];

const defaultForm = {
  pcon_desc: '', pcon_clave_concepto: '', pcon_ind_fijo: 'N', pcon_clave_ctaco: '',
  pcon_ind_aguinaldo: 'N', pcon_clas_concepto: '', pcon_clas_conc_descuento: '',
  pcon_conc_aguinaldo: 'N', pcon_conc_horas_extras: 'N', pcon_conc_bonif_familiar: 'N',
  pcon_ind_sum_ips: 'N', pcon_recibo_salario: 'S', pcon_ind_otros_beneficios: 'N',
  pcon_anticipo: 'N', pcon_ind_mjt: 'N', pcon_conc_comision: 'N', pcon_suma_bf: 'N', pcon_orden: '',
};

export default function ConceptosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('desc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Concepto | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['conceptos', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getConceptos({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const { data: clasConc } = useQuery({ queryKey: ['clasificaciones-concepto'], queryFn: () => getClasificacionesConcepto({ all: true }) });
  const clasificaciones = clasConc?.data ?? [];

  const { data: clasDesc } = useQuery({ queryKey: ['clasificaciones-descuento', { all: true }], queryFn: () => getClasificacionesDescuento({ all: true }) });
  const clasDescuentos = clasDesc?.data ?? [];

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['conceptos'] });

  const createMut = useMutation({ mutationFn: createConcepto, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Concepto> }) => updateConcepto(id, data), onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteConcepto, onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm(defaultForm); setError(''); setModal(true); };
  const openEdit = (r: Concepto) => {
    setEditing(r);
    setForm({
      pcon_desc: r.pcon_desc ?? '', pcon_clave_concepto: r.pcon_clave_concepto?.toString() ?? '',
      pcon_ind_fijo: r.pcon_ind_fijo ?? 'N', pcon_clave_ctaco: r.pcon_clave_ctaco?.toString() ?? '',
      pcon_ind_aguinaldo: r.pcon_ind_aguinaldo ?? 'N', pcon_clas_concepto: r.pcon_clas_concepto?.toString() ?? '',
      pcon_clas_conc_descuento: r.pcon_clas_conc_descuento?.toString() ?? '',
      pcon_conc_aguinaldo: r.pcon_conc_aguinaldo ?? 'N', pcon_conc_horas_extras: r.pcon_conc_horas_extras ?? 'N',
      pcon_conc_bonif_familiar: r.pcon_conc_bonif_familiar ?? 'N', pcon_ind_sum_ips: r.pcon_ind_sum_ips ?? 'N',
      pcon_recibo_salario: r.pcon_recibo_salario ?? 'S', pcon_ind_otros_beneficios: r.pcon_ind_otros_beneficios ?? 'N',
      pcon_anticipo: r.pcon_anticipo ?? 'N', pcon_ind_mjt: r.pcon_ind_mjt ?? 'N',
      pcon_conc_comision: r.pcon_conc_comision ?? 'N', pcon_suma_bf: r.pcon_suma_bf ?? 'N',
      pcon_orden: r.pcon_orden?.toString() ?? '',
    });
    setError(''); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.pcon_desc.trim()) { setError('La descripción es requerida'); return; }
    const payload: any = {
      pcon_desc: form.pcon_desc,
      pcon_clave_concepto: form.pcon_clave_concepto ? Number(form.pcon_clave_concepto) : null,
      pcon_ind_fijo: form.pcon_ind_fijo, pcon_clave_ctaco: form.pcon_clave_ctaco ? Number(form.pcon_clave_ctaco) : null,
      pcon_ind_aguinaldo: form.pcon_ind_aguinaldo,
      pcon_clas_concepto: form.pcon_clas_concepto ? Number(form.pcon_clas_concepto) : null,
      pcon_clas_conc_descuento: form.pcon_clas_conc_descuento ? Number(form.pcon_clas_conc_descuento) : null,
      pcon_conc_aguinaldo: form.pcon_conc_aguinaldo, pcon_conc_horas_extras: form.pcon_conc_horas_extras,
      pcon_conc_bonif_familiar: form.pcon_conc_bonif_familiar, pcon_ind_sum_ips: form.pcon_ind_sum_ips,
      pcon_recibo_salario: form.pcon_recibo_salario, pcon_ind_otros_beneficios: form.pcon_ind_otros_beneficios,
      pcon_anticipo: form.pcon_anticipo, pcon_ind_mjt: form.pcon_ind_mjt,
      pcon_conc_comision: form.pcon_conc_comision, pcon_suma_bf: form.pcon_suma_bf,
      pcon_orden: form.pcon_orden ? Number(form.pcon_orden) : null,
    };
    if (editing) updateMut.mutate({ id: editing.pcon_clave, data: payload });
    else createMut.mutate(payload);
  };

  const toggle = (key: string) => setForm((f: any) => ({ ...f, [key]: f[key] === 'S' ? 'N' : 'S' }));

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Conceptos de liquidación</h1>
          <p className="text-sm text-gray-500 mt-0.5">Conceptos para la liquidación de haberes</p>
        </div>
        <PrimaryAddButton label="Nuevo concepto" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por descripción..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => r.pcon_clave}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate(r.pcon_clave)}
          deleteConfirmMessage="¿Eliminar este concepto?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar concepto' : 'Nuevo concepto'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error} wide>
          <div className="space-y-4">
            {/* Datos principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                <input value={form.pcon_desc} onChange={(e) => setForm((f) => ({ ...f, pcon_desc: e.target.value }))} placeholder="Ej: SALARIO" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación de concepto</label>
                <select value={form.pcon_clas_concepto} onChange={(e) => setForm((f) => ({ ...f, pcon_clas_concepto: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Sin clasificación —</option>
                  {clasificaciones.map((c: any) => <option key={c.clco_codigo} value={c.clco_codigo}>{c.clco_desc} ({TIPO_CLAS[c.clco_tipo] || c.clco_tipo})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación de descuento</label>
                <select value={form.pcon_clas_conc_descuento} onChange={(e) => setForm((f) => ({ ...f, pcon_clas_conc_descuento: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Sin clasificación —</option>
                  {clasDescuentos.map((c: any) => <option key={c.clde_codigo} value={c.clde_codigo}>{c.clde_desc}</option>)}
                </select>
              </div>
            </div>

            {/* Códigos numéricos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clave concepto</label>
                <input type="number" value={form.pcon_clave_concepto} onChange={(e) => setForm((f) => ({ ...f, pcon_clave_concepto: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clave cuenta contable</label>
                <input type="number" value={form.pcon_clave_ctaco} onChange={(e) => setForm((f) => ({ ...f, pcon_clave_ctaco: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <input type="number" value={form.pcon_orden} onChange={(e) => setForm((f) => ({ ...f, pcon_orden: e.target.value }))} placeholder="Ej: 1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            {/* Indicadores (flags) */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Indicadores</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {[
                  { key: 'pcon_ind_fijo',              label: 'Fijo' },
                  { key: 'pcon_ind_aguinaldo',         label: 'Base aguinaldo' },
                  { key: 'pcon_conc_aguinaldo',        label: 'Conc. aguinaldo' },
                  { key: 'pcon_conc_horas_extras',     label: 'Horas extras' },
                  { key: 'pcon_conc_bonif_familiar',   label: 'Bonif. familiar' },
                  { key: 'pcon_ind_sum_ips',           label: 'Suma IPS' },
                  { key: 'pcon_recibo_salario',        label: 'En recibo' },
                  { key: 'pcon_ind_otros_beneficios',  label: 'Otros beneficios' },
                  { key: 'pcon_anticipo',              label: 'Anticipo' },
                  { key: 'pcon_ind_mjt',               label: 'MJT' },
                  { key: 'pcon_conc_comision',         label: 'Comisión' },
                  { key: 'pcon_suma_bf',               label: 'Suma BF' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(form as any)[key] === 'S'} onChange={() => toggle(key)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
