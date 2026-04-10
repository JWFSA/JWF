'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendedores, getOperadoresVendedores, createVendedor, updateVendedor, deleteVendedor, getZonas } from '@/services/fac';
import { getEmpresas } from '@/services/gen';
import type { Vendedor } from '@/types/fac';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

type ModalState = null | 'nuevo' | Vendedor;
const empty = { vend_oper: 0, vend_zona: 0, vend_empr: 0, vend_porc_comision_vta: 0 };

const COLUMNS = [
  { key: 'legajo',   header: 'Legajo',     sortKey: 'leg',  headerClassName: 'w-20', cell: (v: Vendedor) => v.vend_legajo, cellClassName: 'font-mono text-xs text-gray-500' },
  { key: 'nombre',   header: 'Nombre',     sortKey: 'nom',  cell: (v: Vendedor) => `${v.oper_nombre ?? ''} ${v.oper_apellido ?? ''}`.trim(), cellClassName: 'font-medium text-gray-800' },
  { key: 'zona',     header: 'Zona',       sortKey: 'zona', headerClassName: 'hidden md:table-cell', cell: (v: Vendedor) => v.zona_desc ?? '—', cellClassName: 'text-gray-500 hidden md:table-cell' },
  { key: 'empresa',  header: 'Empresa',    headerClassName: 'hidden lg:table-cell', cell: (v: Vendedor) => v.empr_razon_social ?? '—', cellClassName: 'text-gray-500 hidden lg:table-cell' },
  { key: 'comision', header: '% Comisión', headerClassName: 'hidden md:table-cell text-right', cell: (v: Vendedor) => `${v.vend_porc_comision_vta}%`, cellClassName: 'hidden md:table-cell text-right text-gray-500' },
  { key: 'sit', header: 'Situación', headerClassName: 'hidden lg:table-cell w-24',
    cell: (v: Vendedor) => {
      const sit = v.empl_situacion ?? '—';
      return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sit === 'A' ? 'bg-green-100 text-green-700' : sit === 'I' ? 'bg-gray-100 text-gray-500' : ''}`}>
          {sit === 'A' ? 'Activo' : sit === 'I' ? 'Inactivo' : '—'}
        </span>
      );
    },
    cellClassName: 'hidden lg:table-cell',
  },
];

export default function VendedoresPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('nom');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['vendedores', { page, limit, search: debouncedSearch, sortField, sortDir }],
    queryFn: () => getVendedores({ page, limit, search: debouncedSearch, sortField, sortDir }),
  });

  const { data: operadoresData } = useQuery({ queryKey: ['operadores-vendedores'], queryFn: () => getOperadoresVendedores() });
  const { data: zonasData }      = useQuery({ queryKey: ['zonas', { all: true }], queryFn: () => getZonas({ all: true }) });
  const { data: empresasData }   = useQuery({ queryKey: ['empresas', { all: true }], queryFn: () => getEmpresas({ all: true }) });

  const vendedores  = data?.data ?? [];
  const pagination  = data?.pagination;
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };
  const operadores  = operadoresData ?? [];
  const zonas       = zonasData?.data ?? [];
  const empresas    = empresasData?.data ?? [];

  const inv = () => qc.invalidateQueries({ queryKey: ['vendedores'] });

  const openNuevo  = () => { setForm(empty); setError(''); setModal('nuevo'); };
  const openEditar = (v: Vendedor) => { setForm({ vend_oper: v.vend_oper, vend_zona: v.vend_zona ?? 0, vend_empr: v.vend_empr ?? 0, vend_porc_comision_vta: v.vend_porc_comision_vta }); setError(''); setModal(v); };

  const createMut = useMutation({ mutationFn: createVendedor, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateVendedor(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteVendedor, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.vend_oper) { setError('El empleado es requerido'); return; }
    const payload = { ...form, vend_zona: form.vend_zona || null, vend_empr: form.vend_empr || null } as any;
    modal === 'nuevo' ? createMut.mutate(payload) : updateMut.mutate({ id: (modal as Vendedor).vend_legajo, data: payload });
  };

  const sel = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Vendedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Equipo de ventas</p>
        </div>
        <PrimaryAddButton label="Nuevo vendedor" shortLabel="Nuevo" onClick={openNuevo} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar vendedor..." />
        </div>
        <DataTable isLoading={isLoading} rows={vendedores} getRowKey={(v) => v.vend_legajo}
          onEdit={openEditar} onDelete={(v) => deleteMut.mutate(v.vend_legajo)}
          deleteConfirmMessage="¿Eliminar este vendedor?"
          tableClassName="w-full min-w-[500px] text-sm"
          sortField={sortField} sortDir={sortDir} onSortChange={handleSortChange}
          columns={COLUMNS}
        />
        {pagination && <TablePagination total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages} onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>
      {modal !== null && (
        <FormModal title={modal === 'nuevo' ? 'Nuevo vendedor' : `Editar vendedor #${(modal as Vendedor).vend_legajo}`}
          onClose={() => setModal(null)} onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending} error={error}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado <span className="text-red-500">*</span></label>
            <select value={form.vend_oper} onChange={(e) => setForm({ ...form, vend_oper: Number(e.target.value) })} className={sel} disabled={modal !== 'nuevo'}>
              <option value={0}>Seleccionar empleado...</option>
              {operadores.filter((o) => {
                const yaEsVendedor = vendedores.some((v) => v.vend_oper === o.oper_codigo);
                if (modal === 'nuevo') return o.empl_situacion !== 'I' && !yaEsVendedor;
                return o.oper_codigo === form.vend_oper;
              }).map((o) => (
                <option key={o.oper_codigo} value={o.oper_codigo}>{o.oper_nombre} {o.oper_apellido ?? ''}{o.empl_situacion === 'I' ? ' (Inactivo)' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
            <select value={form.vend_zona} onChange={(e) => setForm({ ...form, vend_zona: Number(e.target.value) })} className={sel}>
              <option value={0}>Sin zona</option>
              {zonas.map((z) => <option key={z.zona_codigo} value={z.zona_codigo}>{z.zona_desc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select value={form.vend_empr} onChange={(e) => setForm({ ...form, vend_empr: Number(e.target.value) })} className={sel}>
              <option value={0}>Sin empresa</option>
              {empresas.map((e: any) => <option key={e.empr_codigo} value={e.empr_codigo}>{e.empr_razon_social}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% Comisión sobre venta</label>
            <input type="number" step="0.01" value={form.vend_porc_comision_vta} onChange={(e) => setForm({ ...form, vend_porc_comision_vta: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
