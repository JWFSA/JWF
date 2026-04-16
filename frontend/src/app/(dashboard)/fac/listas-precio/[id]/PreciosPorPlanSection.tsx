'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Trash2, Monitor, Plus } from 'lucide-react';
import {
  getPreciosPantalla,
  upsertPrecioPantalla,
  deleteAllPreciosPantalla,
  type ListaPrecioPantalla,
} from '@/services/fac';
import { getPlanesPantalla } from '@/services/gen';
import { getArticulos } from '@/services/stk';
import SearchField from '@/components/ui/SearchField';
import { confirmDelete } from '@/lib/swal';

interface Props {
  listaId: number;
}

export default function PreciosPorPlanSection({ listaId }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  // Modal de edición
  const [editing, setEditing] = useState<{ art: number; artDesc: string; plan: string } | null>(null);
  const [editPrecio, setEditPrecio] = useState('');
  const [editError, setEditError] = useState('');

  // Agregar pantalla
  const [showAdd, setShowAdd] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [addArt, setAddArt] = useState<number | null>(null);
  const [addPrecios, setAddPrecios] = useState<Record<string, string>>({});
  const [addError, setAddError] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  // Planes desde la maestra
  const { data: planes = [] } = useQuery({
    queryKey: ['planes-pantalla'],
    queryFn: getPlanesPantalla,
  });
  const planesActivos = useMemo(() => planes.filter((p) => p.plan_activo === 'S'), [planes]);

  const { data, isLoading } = useQuery({
    queryKey: ['lista-precio-pantallas', listaId, { search }],
    queryFn: () => getPreciosPantalla(listaId, { search: search || undefined }),
  });

  // Pantallas disponibles (línea 12) para el selector de agregar
  const { data: articulosData } = useQuery({
    queryKey: ['articulos-pantalla'],
    queryFn: () => getArticulos({ linea: '12', all: 'true' } as any),
    enabled: showAdd,
  });

  const pantallasDisponibles = useMemo(() => {
    if (!articulosData?.data || !data) return [];
    const yaAgregados = new Set(data.map((r) => r.lppd_art));
    return articulosData.data
      .filter((a) => !yaAgregados.has(a.art_codigo))
      .filter((a) => !addSearch || a.art_desc.toLowerCase().includes(addSearch.toLowerCase()));
  }, [articulosData, data, addSearch]);

  const inv = () => qc.invalidateQueries({ queryKey: ['lista-precio-pantallas', listaId] });

  const upsertMut = useMutation({
    mutationFn: ({ art, plan, precio }: { art: number; plan: string; precio: number }) =>
      upsertPrecioPantalla(listaId, art, plan as any, { precio_unitario: precio }),
    onSuccess: () => { inv(); setEditing(null); setEditPrecio(''); setEditError(''); },
    onError: (e: any) => setEditError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const deleteMut = useMutation({
    mutationFn: (art: number) => deleteAllPreciosPantalla(listaId, art),
    onSuccess: inv,
  });

  // Auto-calcular EXCLUSIVE y CUSTOM cuando cambia BASIC o PREMIUM
  const DEFAULTS: Record<string, { base: string; factor: number }> = {
    EXCLUSIVE: { base: 'PREMIUM', factor: 2.5 },
    CUSTOM:    { base: 'BASIC',   factor: 4 },
  };

  function handlePrecioChange(planCodigo: string, valor: string) {
    const next = { ...addPrecios, [planCodigo]: valor };
    // Si cambió un plan base, auto-calcular los derivados (solo si el derivado está vacío o era auto-calculado)
    for (const [derivado, cfg] of Object.entries(DEFAULTS)) {
      if (planCodigo === cfg.base && planesActivos.some((p) => p.plan_codigo === derivado)) {
        const baseVal = Number(valor);
        if (baseVal > 0) {
          const calc = (baseVal * cfg.factor).toFixed(2);
          // Solo autorellenar si está vacío o si el valor actual coincide con el cálculo anterior
          const prev = addPrecios[derivado];
          const prevBase = Number(addPrecios[cfg.base] || 0);
          const prevCalc = (prevBase * cfg.factor).toFixed(2);
          if (!prev || prev === prevCalc) {
            next[derivado] = calc;
          }
        }
      }
    }
    setAddPrecios(next);
  }

  async function handleAddPantalla() {
    if (!addArt) { setAddError('Seleccioná una pantalla'); return; }
    const entries = planesActivos
      .filter((p) => addPrecios[p.plan_codigo] && Number(addPrecios[p.plan_codigo]) > 0)
      .map((p) => ({ plan: p.plan_codigo, precio: Number(addPrecios[p.plan_codigo]) }));
    if (entries.length === 0) { setAddError('Cargá al menos un precio'); return; }
    setAddSaving(true);
    setAddError('');
    try {
      for (const { plan, precio } of entries) {
        await upsertPrecioPantalla(listaId, addArt, plan as any, { precio_unitario: precio });
      }
      inv();
      setShowAdd(false);
      setAddArt(null);
      setAddPrecios({});
      setAddSearch('');
    } catch (e: any) {
      setAddError(e?.response?.data?.message ?? 'Error al guardar');
    } finally {
      setAddSaving(false);
    }
  }

  const openEdit = (row: ListaPrecioPantalla, plan: string) => {
    const existente = row.precios[plan as keyof typeof row.precios];
    setEditing({ art: row.lppd_art, artDesc: row.art_desc, plan });
    setEditPrecio(existente ? String(existente.precio_unitario) : '');
    setEditError('');
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    const precio = Number(editPrecio);
    if (isNaN(precio) || precio < 0) { setEditError('El precio debe ser un número >= 0'); return; }
    upsertMut.mutate({ art: editing.art, plan: editing.plan, precio });
  };

  const rows = data ?? [];
  const inp = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
      <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <Monitor size={18} className="text-primary-600 shrink-0" />
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-sm font-semibold text-gray-800">Pantallas DOOH</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Precios por plan de artículos con línea "Pantalla"
          </p>
        </div>
        <SearchField value={search} onChange={setSearch} placeholder="Buscar pantalla..." />
        <button
          onClick={() => { setShowAdd(!showAdd); setAddArt(null); setAddPrecios({}); setAddSearch(''); setAddError(''); }}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition"
        >
          <Plus size={14} /> Agregar pantalla
        </button>
      </div>

      {/* Formulario agregar pantalla */}
      {showAdd && (
        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-4 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Pantalla</label>
              <div className="relative">
                <input
                  type="text"
                  value={addArt ? pantallasDisponibles.find((p) => p.art_codigo === addArt)?.art_desc ?? addSearch : addSearch}
                  onChange={(e) => { setAddSearch(e.target.value); setAddArt(null); }}
                  placeholder="Buscar pantalla para agregar..."
                  className={`w-full ${inp}`}
                />
                {addSearch && !addArt && pantallasDisponibles.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {pantallasDisponibles.slice(0, 10).map((p) => (
                      <button
                        key={p.art_codigo}
                        type="button"
                        onClick={() => { setAddArt(p.art_codigo); setAddSearch(p.art_desc); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700 transition"
                      >
                        {p.art_desc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {planesActivos.map((plan) => (
              <div key={plan.plan_codigo} className="w-28">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {plan.plan_nombre}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addPrecios[plan.plan_codigo] ?? ''}
                  onChange={(e) => handlePrecioChange(plan.plan_codigo, e.target.value)}
                  placeholder="0.00"
                  className={`w-full text-right ${inp}`}
                />
              </div>
            ))}
            <button
              onClick={handleAddPantalla}
              disabled={addSaving || !addArt}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              <Save size={14} /> {addSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
          {addError && <p className="text-xs text-red-600">{addError}</p>}
        </div>
      )}

      {isLoading ? (
        <p className="px-4 py-8 text-center text-sm text-gray-400">Cargando...</p>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-sm text-gray-500">
          <Monitor size={24} className="text-gray-300" />
          <span>
            {search
              ? 'No hay pantallas que coincidan con la búsqueda.'
              : 'No hay pantallas con precios por plan cargados en esta lista.'}
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Pantalla</th>
                {planesActivos.map((plan) => (
                  <th key={plan.plan_codigo} className="text-right px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <div>{plan.plan_nombre}</div>
                    <div className="text-[10px] font-normal text-gray-400 normal-case tabular-nums">
                      {plan.plan_inserciones} ins/mes
                    </div>
                  </th>
                ))}
                <th className="w-12 px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.lppd_art} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{row.art_desc}</td>
                  {planesActivos.map((plan) => {
                    const precio = row.precios[plan.plan_codigo as keyof typeof row.precios];
                    return (
                      <td
                        key={plan.plan_codigo}
                        onClick={() => openEdit(row, plan.plan_codigo)}
                        className="px-3 py-2.5 text-right font-mono text-xs text-gray-700 cursor-pointer hover:bg-primary-50 hover:text-primary-700 transition tabular-nums"
                        title="Click para editar"
                      >
                        {precio
                          ? Number(precio.precio_unitario).toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : <span className="text-gray-300">—</span>}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2.5 text-center">
                    <button
                      onClick={async () => {
                        if (await confirmDelete(`¿Quitar "${row.art_desc}" de esta lista?`)) deleteMut.mutate(row.lppd_art);
                      }}
                      className="text-gray-400 hover:text-red-600 transition p-1"
                      title="Eliminar todos los precios"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición */}
      {editing && (() => {
        const planInfo = planesActivos.find((p) => p.plan_codigo === editing.plan);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Editar precio</h3>
              <p className="text-xs text-gray-500 mb-1">{editing.artDesc}</p>
              <p className="text-xs text-primary-700 font-medium mb-4 tabular-nums">
                Plan {planInfo?.plan_nombre ?? editing.plan} · {planInfo?.plan_inserciones ?? '?'} inserciones/mes
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio unitario <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPrecio}
                  onChange={(e) => setEditPrecio(e.target.value)}
                  className={`w-full text-right ${inp}`}
                  autoFocus
                />
                {editError && <p className="mt-2 text-xs text-red-600">{editError}</p>}
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={upsertMut.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <Save size={14} />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
