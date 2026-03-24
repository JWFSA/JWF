'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMonedas, createMoneda, updateMoneda, deleteMoneda } from '@/services/gen';
import type { Moneda } from '@/types/gen';
import Modal from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';

const empty = { mon_desc: '', mon_simbolo: '', mon_tasa_comp: 0, mon_tasa_vta: 0 };

export default function MonedasPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'nueva' | Moneda>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const { data: monedas = [], isLoading } = useQuery({ queryKey: ['monedas'], queryFn: getMonedas });

  const inv = () => qc.invalidateQueries({ queryKey: ['monedas'] });

  const openNueva  = () => { setForm(empty); setError(''); setModal('nueva'); };
  const openEditar = (m: Moneda) => { setForm({ mon_desc: m.mon_desc, mon_simbolo: m.mon_simbolo ?? '', mon_tasa_comp: m.mon_tasa_comp ?? 0, mon_tasa_vta: m.mon_tasa_vta ?? 0 }); setError(''); setModal(m); };

  const createMut = useMutation({ mutationFn: createMoneda, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateMoneda(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteMoneda, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.mon_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nueva' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Moneda).mon_codigo, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Monedas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monedas y tasas de cambio</p>
        </div>
        <button onClick={openNueva} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={16} /><span className="hidden sm:inline">Nueva moneda</span><span className="sm:hidden">Nueva</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 w-20">Código</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3 w-16">Símbolo</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Tasa compra</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Tasa venta</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
            ) : monedas.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin registros</td></tr>
            ) : monedas.map((m) => (
              <tr key={m.mon_codigo} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.mon_codigo}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{m.mon_desc}</td>
                <td className="px-4 py-3 text-gray-500">{m.mon_simbolo}</td>
                <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{m.mon_tasa_comp?.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{m.mon_tasa_vta?.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditar(m)} className="text-gray-400 hover:text-primary-600 transition"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('¿Eliminar esta moneda?')) deleteMut.mutate(m.mon_codigo); }} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <Modal title={modal === 'nueva' ? 'Nueva moneda' : `Editar: ${(modal as Moneda).mon_desc}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={form.mon_desc} onChange={(e) => setForm({ ...form, mon_desc: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Símbolo</label>
              <input value={form.mon_simbolo} onChange={(e) => setForm({ ...form, mon_simbolo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: $, Gs, USD" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasa compra</label>
                <input type="number" value={form.mon_tasa_comp} onChange={(e) => setForm({ ...form, mon_tasa_comp: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tasa venta</label>
                <input type="number" value={form.mon_tasa_vta} onChange={(e) => setForm({ ...form, mon_tasa_vta: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">
            <button onClick={() => setModal(null)} className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSubmit} disabled={isPending} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
              <Save size={14} />{isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
