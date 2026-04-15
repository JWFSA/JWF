'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Trash2, Monitor } from 'lucide-react';
import {
  getPreciosPantalla,
  upsertPrecioPantalla,
  deleteAllPreciosPantalla,
  type ListaPrecioPantalla,
  type PlanPantalla,
} from '@/services/fac';
import SearchField from '@/components/ui/SearchField';
import { confirmDelete } from '@/lib/swal';

const PLANES: PlanPantalla[] = ['BASIC', 'GURU', 'PREMIUM'];
const INSERCIONES_DEFAULT: Record<PlanPantalla, number> = { BASIC: 280, GURU: 520, PREMIUM: 1040 };

interface Props {
  listaId: number;
}

export default function PreciosPorPlanSection({ listaId }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  // Modal de edición
  const [editing, setEditing] = useState<{ art: number; artDesc: string; plan: PlanPantalla } | null>(null);
  const [editPrecio, setEditPrecio] = useState('');
  const [editError, setEditError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['lista-precio-pantallas', listaId, { search }],
    queryFn: () => getPreciosPantalla(listaId, { search: search || undefined }),
  });

  const inv = () => qc.invalidateQueries({ queryKey: ['lista-precio-pantallas', listaId] });

  const upsertMut = useMutation({
    mutationFn: ({ art, plan, precio }: { art: number; plan: PlanPantalla; precio: number }) =>
      upsertPrecioPantalla(listaId, art, plan, { precio_unitario: precio }),
    onSuccess: () => { inv(); setEditing(null); setEditPrecio(''); setEditError(''); },
    onError: (e: any) => setEditError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const deleteMut = useMutation({
    mutationFn: (art: number) => deleteAllPreciosPantalla(listaId, art),
    onSuccess: inv,
  });

  const openEdit = (row: ListaPrecioPantalla, plan: PlanPantalla) => {
    const existente = row.precios[plan];
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
            Precios por plan (BASIC / GURU / PREMIUM) de artículos con línea "Pantalla"
          </p>
        </div>
        <div className="w-full sm:w-64">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar pantalla..." />
        </div>
      </div>

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
                {PLANES.map((plan) => (
                  <th key={plan} className="text-right px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <div>{plan}</div>
                    <div className="text-[10px] font-normal text-gray-400 normal-case tabular-nums">
                      {INSERCIONES_DEFAULT[plan]} ins/mes
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
                  {PLANES.map((plan) => {
                    const precio = row.precios[plan];
                    return (
                      <td
                        key={plan}
                        onClick={() => openEdit(row, plan)}
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
                      title="Eliminar los 3 precios"
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
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Editar precio</h3>
            <p className="text-xs text-gray-500 mb-1">{editing.artDesc}</p>
            <p className="text-xs text-primary-700 font-medium mb-4 tabular-nums">
              Plan {editing.plan} · {INSERCIONES_DEFAULT[editing.plan]} inserciones/mes
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio unitario (USD) <span className="text-red-500">*</span>
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
      )}
    </div>
  );
}
