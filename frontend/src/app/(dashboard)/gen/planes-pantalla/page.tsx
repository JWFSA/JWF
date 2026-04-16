'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlanesPantalla, createPlanPantalla, updatePlanPantalla, deletePlanPantalla, type PlanPantalla } from '@/services/gen';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import DataTable from '@/components/ui/DataTable';

const empty = { plan_codigo: '', plan_nombre: '', plan_inserciones: 280, plan_descripcion: '', plan_orden: 0, plan_activo: 'S' };

const COLUMNS = [
  { key: 'codigo',       header: 'Código',       sortKey: 'codigo',       headerClassName: 'w-28',       cell: (p: PlanPantalla) => p.plan_codigo, cellClassName: 'font-mono text-xs font-semibold text-gray-700' },
  { key: 'nombre',       header: 'Nombre',       sortKey: 'nombre',                                      cell: (p: PlanPantalla) => p.plan_nombre, cellClassName: 'font-medium text-gray-800' },
  { key: 'inserciones',  header: 'Inserciones/mes', sortKey: 'inserciones', headerClassName: 'text-right w-36', cell: (p: PlanPantalla) => p.plan_inserciones.toLocaleString('es-PY'), cellClassName: 'text-right tabular-nums text-gray-600' },
  { key: 'descripcion',  header: 'Descripción',                                                          cell: (p: PlanPantalla) => p.plan_descripcion || '—', cellClassName: 'text-gray-500 text-xs max-w-xs truncate' },
  { key: 'orden',        header: 'Orden',        sortKey: 'orden',        headerClassName: 'text-right w-20', cell: (p: PlanPantalla) => p.plan_orden, cellClassName: 'text-right tabular-nums text-gray-500' },
  { key: 'activo',       header: 'Estado',       sortKey: 'activo',       headerClassName: 'w-24',       cell: (p: PlanPantalla) => (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.plan_activo === 'S' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {p.plan_activo === 'S' ? 'Activo' : 'Inactivo'}
    </span>
  )},
];

function sortPlanes(list: PlanPantalla[], field: string, dir: 'asc' | 'desc'): PlanPantalla[] {
  if (!field) return list;
  return [...list].sort((a, b) => {
    let va: any, vb: any;
    if (field === 'codigo')         { va = a.plan_codigo;      vb = b.plan_codigo; }
    else if (field === 'nombre')    { va = a.plan_nombre;      vb = b.plan_nombre; }
    else if (field === 'inserciones') { va = a.plan_inserciones; vb = b.plan_inserciones; }
    else if (field === 'orden')     { va = a.plan_orden;       vb = b.plan_orden; }
    else if (field === 'activo')    { va = a.plan_activo;      vb = b.plan_activo; }
    else                            { va = a.plan_codigo;      vb = b.plan_codigo; }
    if (va == null) return 1; if (vb == null) return -1;
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return dir === 'desc' ? -cmp : cmp;
  });
}

export default function PlanesPantallaPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'nuevo' | PlanPantalla>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState('orden');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: planesRaw = [], isLoading } = useQuery({ queryKey: ['planes-pantalla'], queryFn: getPlanesPantalla });

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const list = q
      ? planesRaw.filter((p) => `${p.plan_codigo} ${p.plan_nombre} ${p.plan_descripcion ?? ''}`.toLowerCase().includes(q))
      : planesRaw;
    return sortPlanes(list, sortField, sortDir);
  }, [planesRaw, debouncedSearch, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const planes = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, safePage, limit]);

  const inv = () => qc.invalidateQueries({ queryKey: ['planes-pantalla'] });
  const handleSortChange = (field: string, dir: 'asc' | 'desc') => { setSortField(field); setSortDir(dir); setPage(1); };

  const openNuevo = () => {
    const nextOrden = planesRaw.length > 0 ? Math.max(...planesRaw.map((p) => p.plan_orden)) + 1 : 1;
    setForm({ ...empty, plan_orden: nextOrden });
    setError('');
    setModal('nuevo');
  };
  const openEditar = (p: PlanPantalla) => {
    setForm({
      plan_codigo: p.plan_codigo,
      plan_nombre: p.plan_nombre,
      plan_inserciones: p.plan_inserciones,
      plan_descripcion: p.plan_descripcion ?? '',
      plan_orden: p.plan_orden,
      plan_activo: p.plan_activo,
    });
    setError('');
    setModal(p);
  };

  const createMut = useMutation({ mutationFn: createPlanPantalla, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ codigo, data }: { codigo: string; data: typeof form }) => updatePlanPantalla(codigo, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deletePlanPantalla, onSuccess: inv, onError: (e: any) => alert(e?.response?.data?.message ?? 'Error al eliminar') });

  const handleSubmit = () => {
    if (!form.plan_codigo.trim()) { setError('El código es requerido'); return; }
    if (!form.plan_nombre.trim()) { setError('El nombre es requerido'); return; }
    if (!form.plan_inserciones || form.plan_inserciones < 1) { setError('Las inserciones deben ser >= 1'); return; }
    modal === 'nuevo' ? createMut.mutate(form) : updateMut.mutate({ codigo: (modal as PlanPantalla).plan_codigo, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;
  const isEditing = modal !== null && modal !== 'nuevo';
  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Planes Pantalla (DOOH)</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tipos de plan disponibles para cotizar pantallas</p>
        </div>
        <PrimaryAddButton label="Nuevo plan" shortLabel="Nuevo" onClick={openNuevo} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar plan..." />
        </div>

        <DataTable
          isLoading={isLoading}
          rows={planes}
          getRowKey={(p) => p.plan_codigo}
          onEdit={openEditar}
          onDelete={(p) => deleteMut.mutate(p.plan_codigo)}
          deleteConfirmMessage="¿Eliminar este plan? Solo se puede si no tiene precios asociados."
          tableClassName="w-full min-w-[700px] text-sm"
          emptyLabel="Sin planes"
          columns={COLUMNS}
          sortField={sortField}
          sortDir={sortDir}
          onSortChange={handleSortChange}
        />

        {!isLoading && (
          <TablePagination
            total={filtered.length}
            page={safePage}
            limit={limit}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nuevo' ? 'Nuevo plan' : `Editar: ${(modal as PlanPantalla).plan_nombre}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código <span className="text-red-500">*</span></label>
              <input
                value={form.plan_codigo}
                onChange={(e) => setForm({ ...form, plan_codigo: e.target.value.toUpperCase() })}
                disabled={isEditing}
                placeholder="Ej: EXCLUSIVE"
                className={`${inp} ${isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input value={form.plan_nombre} onChange={(e) => setForm({ ...form, plan_nombre: e.target.value })} placeholder="Ej: Exclusive" className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inserciones/mes <span className="text-red-500">*</span></label>
              <input type="number" min={1} value={form.plan_inserciones} onChange={(e) => setForm({ ...form, plan_inserciones: parseInt(e.target.value) || 0 })} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" min={0} value={form.plan_orden} onChange={(e) => setForm({ ...form, plan_orden: parseInt(e.target.value) || 0 })} className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.plan_descripcion} onChange={(e) => setForm({ ...form, plan_descripcion: e.target.value })} rows={2} placeholder="Features del plan (opcional)" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.plan_activo} onChange={(e) => setForm({ ...form, plan_activo: e.target.value })} className={inp}>
              <option value="S">Activo</option>
              <option value="N">Inactivo</option>
            </select>
          </div>
        </FormModal>
      )}
    </div>
  );
}
