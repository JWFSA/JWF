'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFamiliares, createFamiliar, updateFamiliar, deleteFamiliar, getEmpleados, getTiposFamiliar } from '@/services/per';
import { formatDate, toInputDate } from '@/lib/utils';
import type { Familiar } from '@/types/per';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

const SEXOS: Record<string, string> = { M: 'Masculino', F: 'Femenino' };

const COLUMNS = [
  { key: 'empl',   header: 'Empleado',    sortKey: 'empleado',                           cell: (r: Familiar) => `${r.empl_nombre ?? ''} ${r.empl_ape ?? ''}`.trim() || '—', cellClassName: 'text-sm text-gray-500' },
  { key: 'nombre', header: 'Familiar',    sortKey: 'nombre',                             cell: (r: Familiar) => r.fam_nombre, cellClassName: 'font-medium text-gray-800' },
  { key: 'tipo',   header: 'Parentesco',  headerClassName: 'hidden sm:table-cell',       cell: (r: Familiar) => r.tipo_desc || '—', cellClassName: 'hidden sm:table-cell text-sm text-gray-500' },
  { key: 'nac',    header: 'Nacimiento',  headerClassName: 'hidden md:table-cell w-28',  cell: (r: Familiar) => formatDate(r.fam_fec_nac), cellClassName: 'hidden md:table-cell text-sm text-gray-500' },
  { key: 'sexo',   header: 'Sexo',        headerClassName: 'hidden md:table-cell w-20',  cell: (r: Familiar) => SEXOS[r.fam_sexo ?? ''] || '—', cellClassName: 'hidden md:table-cell text-sm text-gray-500' },
];

export default function FamiliaresPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('nombre');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Familiar | null>(null);
  const [form, setForm] = useState({ fam_empl_codigo: '', fam_nombre: '', fam_fec_nac: '', fam_tipo: '', fam_sexo: '', fam_ind_cobra: 'N', fam_imp_bonif: '', fam_ind_disc: 'N' });
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['familiares', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getFamiliares({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const { data: emplData } = useQuery({ queryKey: ['empleados', { all: true }], queryFn: () => getEmpleados({ all: true }) });
  const empleados = emplData?.data ?? [];

  const { data: tiposData } = useQuery({ queryKey: ['tipos-familiar', { all: true }], queryFn: () => getTiposFamiliar({ all: true }) });
  const tiposFamiliar = tiposData?.data ?? [];

  const items      = data?.data ?? [];
  const pagination = data?.pagination;
  const handleSortChange = (f: string, d: 'asc' | 'desc') => { setSortField(f); setSortDir(d); setPage(1); };
  const inv = () => qc.invalidateQueries({ queryKey: ['familiares'] });

  const createMut = useMutation({ mutationFn: createFamiliar, onSuccess: () => { inv(); closeModal(); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({
    mutationFn: ({ empleado, id, data }: { empleado: number; id: number; data: Partial<Familiar> }) => updateFamiliar(empleado, id, data),
    onSuccess: () => { inv(); closeModal(); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error'),
  });
  const deleteMut = useMutation({ mutationFn: ({ empleado, id }: { empleado: number; id: number }) => deleteFamiliar(empleado, id), onSuccess: inv });

  const openNew  = () => { setEditing(null); setForm({ fam_empl_codigo: '', fam_nombre: '', fam_fec_nac: '', fam_tipo: '', fam_sexo: '', fam_ind_cobra: 'N', fam_imp_bonif: '', fam_ind_disc: 'N' }); setError(''); setModal(true); };
  const openEdit = (r: Familiar) => {
    setEditing(r);
    setForm({
      fam_empl_codigo: r.fam_empl_codigo?.toString() ?? '',
      fam_nombre: r.fam_nombre,
      fam_fec_nac: toInputDate(r.fam_fec_nac) ?? '',
      fam_tipo: r.fam_tipo?.toString() ?? '',
      fam_sexo: r.fam_sexo ?? '',
      fam_ind_cobra: r.fam_ind_cobra ?? 'N',
      fam_imp_bonif: r.fam_imp_bonif?.toString() ?? '',
      fam_ind_disc: r.fam_ind_disc ?? 'N',
    });
    setError(''); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.fam_empl_codigo || !form.fam_nombre.trim()) { setError('Empleado y nombre son requeridos'); return; }
    const payload = {
      fam_empl_codigo: Number(form.fam_empl_codigo),
      fam_nombre: form.fam_nombre,
      fam_fec_nac: form.fam_fec_nac || null,
      fam_tipo: form.fam_tipo ? Number(form.fam_tipo) : null,
      fam_sexo: form.fam_sexo || null,
      fam_ind_cobra: form.fam_ind_cobra,
      fam_imp_bonif: form.fam_imp_bonif ? Number(form.fam_imp_bonif) : null,
      fam_ind_disc: form.fam_ind_disc,
    };
    if (editing) updateMut.mutate({ empleado: editing.fam_empl_codigo, id: editing.fam_codigo, data: payload });
    else createMut.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Familiares</h1>
          <p className="text-sm text-gray-500 mt-0.5">Familiares registrados del personal</p>
        </div>
        <PrimaryAddButton label="Nuevo familiar" shortLabel="Nuevo" onClick={openNew} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre de familiar o empleado..." />
        </div>
        <DataTable isLoading={isLoading} rows={items} getRowKey={(r) => `${r.fam_empl_codigo}-${r.fam_codigo}`}
          onEdit={openEdit} onDelete={(r) => deleteMut.mutate({ empleado: r.fam_empl_codigo, id: r.fam_codigo })}
          deleteConfirmMessage="¿Eliminar este familiar?"
          tableClassName="w-full text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal && (
        <FormModal title={editing ? 'Editar familiar' : 'Nuevo familiar'} onClose={closeModal} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empleado <span className="text-red-500">*</span></label>
              <select value={form.fam_empl_codigo} onChange={(e) => setForm((f) => ({ ...f, fam_empl_codigo: e.target.value }))} disabled={!!editing} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50">
                <option value="">— Seleccionar empleado —</option>
                {empleados.map((e: any) => <option key={e.empl_legajo} value={e.empl_legajo}>{e.empl_legajo} - {e.empl_nombre} {e.empl_ape ?? ''}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input value={form.fam_nombre} onChange={(e) => setForm((f) => ({ ...f, fam_nombre: e.target.value }))} placeholder="Nombre completo" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
                <select value={form.fam_tipo} onChange={(e) => setForm((f) => ({ ...f, fam_tipo: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Seleccionar —</option>
                  {tiposFamiliar.map((t: any) => <option key={t.tipo_codigo} value={t.tipo_codigo}>{t.tipo_desc}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha nacimiento</label>
                <input type="date" value={form.fam_fec_nac} onChange={(e) => setForm((f) => ({ ...f, fam_fec_nac: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select value={form.fam_sexo} onChange={(e) => setForm((f) => ({ ...f, fam_sexo: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Seleccionar —</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.fam_ind_cobra === 'S'} onChange={(e) => setForm((f) => ({ ...f, fam_ind_cobra: e.target.checked ? 'S' : 'N' }))} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">Cobra bonificación</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.fam_ind_disc === 'S'} onChange={(e) => setForm((f) => ({ ...f, fam_ind_disc: e.target.checked ? 'S' : 'N' }))} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">Discapacidad</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importe bonif.</label>
                <input type="number" value={form.fam_imp_bonif} onChange={(e) => setForm((f) => ({ ...f, fam_imp_bonif: e.target.value }))} placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
