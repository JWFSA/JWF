'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProgramas, createPrograma, updatePrograma, deletePrograma, getSistemas } from '@/services/gen';
import type { Programa } from '@/types/gen';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import { Pencil, Trash2 } from 'lucide-react';

const empty = { prog_desc: '', prog_sistema: 0 };

export default function ProgramasPage() {
  const qc = useQueryClient();
  const [sistemaFiltro, setSistemaFiltro] = useState<number | ''>('');
  const [modal, setModal] = useState<null | 'nuevo' | Programa>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const { data: sistemas = [] } = useQuery({ queryKey: ['sistemas'], queryFn: getSistemas });

  const { data: programas = [], isLoading } = useQuery({
    queryKey: ['programas', sistemaFiltro],
    queryFn: () => getProgramas(sistemaFiltro || undefined),
  });

  const inv = () => qc.invalidateQueries({ queryKey: ['programas'] });

  const openNuevo  = () => { setForm(empty); setError(''); setModal('nuevo'); };
  const openEditar = (p: Programa) => { setForm({ prog_desc: p.prog_desc, prog_sistema: p.prog_sistema }); setError(''); setModal(p); };

  const createMut = useMutation({ mutationFn: createPrograma, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updatePrograma(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deletePrograma, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.prog_desc.trim()) { setError('La descripción es requerida'); return; }
    if (!form.prog_sistema) { setError('El sistema es requerido'); return; }
    modal === 'nuevo' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as Programa).prog_clave, data: form });
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Programas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Funcionalidades del sistema por módulo</p>
        </div>
        <PrimaryAddButton label="Nuevo programa" shortLabel="Nuevo" onClick={openNuevo} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <select
            value={sistemaFiltro}
            onChange={(e) => setSistemaFiltro(e.target.value ? Number(e.target.value) : '')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-56"
          >
            <option value="">Todos los sistemas</option>
            {sistemas.map((s) => (
              <option key={s.sist_codigo} value={s.sist_codigo}>{s.sist_desc}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 w-24">Clave</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 hidden md:table-cell">Sistema</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : programas.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Sin registros</td></tr>
              ) : programas.map((p) => (
                <tr key={p.prog_clave} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.prog_clave}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.prog_desc}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.sist_desc ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditar(p)} className="text-gray-400 hover:text-primary-600 transition"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar este programa?')) deleteMut.mutate(p.prog_clave); }} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nuevo' ? 'Nuevo programa' : `Editar: ${(modal as Programa).prog_desc}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.prog_desc} onChange={(e) => setForm({ ...form, prog_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sistema <span className="text-red-500">*</span></label>
            <select value={form.prog_sistema} onChange={(e) => setForm({ ...form, prog_sistema: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value={0}>Seleccionar sistema...</option>
              {sistemas.map((s) => (
                <option key={s.sist_codigo} value={s.sist_codigo}>{s.sist_desc}</option>
              ))}
            </select>
          </div>
        </FormModal>
      )}
    </div>
  );
}
