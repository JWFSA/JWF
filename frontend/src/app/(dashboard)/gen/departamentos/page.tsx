'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartamentos, createDepartamento, updateDepartamento, deleteDepartamento, getSecciones, createSeccion, updateSeccion, deleteSeccion } from '@/services/gen';
import type { Departamento, Seccion } from '@/types/gen';
import Modal from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, Save, ChevronDown } from 'lucide-react';

type DptoModal = null | 'nuevo' | Departamento;
type SeccModal = null | 'nueva' | Seccion;

export default function DepartamentosPage() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<number | null>(null);

  const [dptoModal, setDptoModal] = useState<DptoModal>(null);
  const [dptoForm, setDptoForm] = useState({ dpto_desc: '' });
  const [dptoError, setDptoError] = useState('');

  const [seccModal, setSeccModal] = useState<SeccModal>(null);
  const [seccDpto, setSeccDpto] = useState<number | null>(null);
  const [seccForm, setSeccForm] = useState({ secc_desc: '' });
  const [seccError, setSeccError] = useState('');

  const { data: departamentos = [], isLoading } = useQuery({ queryKey: ['departamentos'], queryFn: getDepartamentos });

  const { data: secciones = [] } = useQuery({
    queryKey: ['secciones', expanded],
    queryFn: () => getSecciones(expanded!),
    enabled: expanded !== null,
  });

  const invDptos = () => qc.invalidateQueries({ queryKey: ['departamentos'] });
  const invSeccs = () => qc.invalidateQueries({ queryKey: ['secciones', seccDpto] });

  // Departamento mutations
  const createDptoMut = useMutation({ mutationFn: createDepartamento, onSuccess: () => { invDptos(); setDptoModal(null); }, onError: (e: any) => setDptoError(e?.response?.data?.message ?? 'Error') });
  const updateDptoMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof dptoForm }) => updateDepartamento(id, data), onSuccess: () => { invDptos(); setDptoModal(null); }, onError: (e: any) => setDptoError(e?.response?.data?.message ?? 'Error') });
  const deleteDptoMut = useMutation({ mutationFn: deleteDepartamento, onSuccess: invDptos });

  // Sección mutations
  const createSeccMut = useMutation({ mutationFn: ({ dpto, data }: { dpto: number; data: typeof seccForm }) => createSeccion(dpto, data), onSuccess: () => { invSeccs(); setSeccModal(null); }, onError: (e: any) => setSeccError(e?.response?.data?.message ?? 'Error') });
  const updateSeccMut = useMutation({ mutationFn: ({ dpto, id, data }: { dpto: number; id: number; data: typeof seccForm }) => updateSeccion(dpto, id, data), onSuccess: () => { invSeccs(); setSeccModal(null); }, onError: (e: any) => setSeccError(e?.response?.data?.message ?? 'Error') });
  const deleteSeccMut = useMutation({ mutationFn: ({ dpto, id }: { dpto: number; id: number }) => deleteSeccion(dpto, id), onSuccess: invSeccs });

  const openNuevoDpto  = () => { setDptoForm({ dpto_desc: '' }); setDptoError(''); setDptoModal('nuevo'); };
  const openEditarDpto = (d: Departamento) => { setDptoForm({ dpto_desc: d.dpto_desc }); setDptoError(''); setDptoModal(d); };

  const openNuevaSecc  = (dptoId: number) => { setSeccDpto(dptoId); setSeccForm({ secc_desc: '' }); setSeccError(''); setSeccModal('nueva'); };
  const openEditarSecc = (s: Seccion) => { setSeccDpto(s.secc_dpto); setSeccForm({ secc_desc: s.secc_desc }); setSeccError(''); setSeccModal(s); };

  const handleDptoSubmit = () => {
    if (!dptoForm.dpto_desc.trim()) { setDptoError('La descripción es requerida'); return; }
    dptoModal === 'nuevo'
      ? createDptoMut.mutate(dptoForm)
      : updateDptoMut.mutate({ id: (dptoModal as Departamento).dpto_codigo, data: dptoForm });
  };

  const handleSeccSubmit = () => {
    if (!seccForm.secc_desc.trim()) { setSeccError('La descripción es requerida'); return; }
    if (seccModal === 'nueva') {
      createSeccMut.mutate({ dpto: seccDpto!, data: seccForm });
    } else {
      const s = seccModal as Seccion;
      updateSeccMut.mutate({ dpto: s.secc_dpto, id: s.secc_codigo, data: seccForm });
    }
  };

  const isDptoPending = createDptoMut.isPending || updateDptoMut.isPending;
  const isSeccPending = createSeccMut.isPending || updateSeccMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Departamentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Departamentos y sus secciones</p>
        </div>
        <button onClick={openNuevoDpto} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={16} /><span className="hidden sm:inline">Nuevo departamento</span><span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">Cargando...</p>
        ) : departamentos.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">Sin registros</p>
        ) : (departamentos as Departamento[]).map((d) => (
          <div key={d.dpto_codigo}>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition">
              <button
                onClick={() => setExpanded(expanded === d.dpto_codigo ? null : d.dpto_codigo)}
                className="flex-1 flex items-center gap-3 text-sm text-left"
              >
                <span className="font-mono text-xs text-gray-400 w-8">{d.dpto_codigo}</span>
                <span className="font-medium text-gray-800">{d.dpto_desc}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ml-1 ${expanded === d.dpto_codigo ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex items-center gap-2 ml-3">
                <button onClick={() => openEditarDpto(d)} className="text-gray-400 hover:text-primary-600 transition"><Pencil size={14} /></button>
                <button onClick={() => { if (confirm('¿Eliminar este departamento?')) deleteDptoMut.mutate(d.dpto_codigo); }} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
              </div>
            </div>

            {expanded === d.dpto_codigo && (
              <div className="bg-gray-50 px-4 pb-3 border-t border-gray-100">
                <div className="flex items-center justify-between pt-2 pl-11 mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secciones</span>
                  <button onClick={() => openNuevaSecc(d.dpto_codigo)} className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                    <Plus size={12} /> Nueva sección
                  </button>
                </div>
                {(secciones as Seccion[]).length === 0 ? (
                  <p className="text-xs text-gray-400 pl-11">Sin secciones</p>
                ) : (
                  <div className="pl-11 space-y-1">
                    {(secciones as Seccion[]).map((s) => (
                      <div key={`${s.secc_dpto}-${s.secc_codigo}`} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="font-mono text-gray-400">{s.secc_codigo}</span>
                          <span>{s.secc_desc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditarSecc(s)} className="text-gray-400 hover:text-primary-600 transition"><Pencil size={12} /></button>
                          <button onClick={() => { if (confirm('¿Eliminar esta sección?')) deleteSeccMut.mutate({ dpto: s.secc_dpto, id: s.secc_codigo }); }} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {dptoModal !== null && (
        <Modal title={dptoModal === 'nuevo' ? 'Nuevo departamento' : `Editar: ${(dptoModal as Departamento).dpto_desc}`} onClose={() => setDptoModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={dptoForm.dpto_desc} onChange={(e) => setDptoForm({ dpto_desc: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            {dptoError && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{dptoError}</p>}
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">
            <button onClick={() => setDptoModal(null)} className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleDptoSubmit} disabled={isDptoPending} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
              <Save size={14} />{isDptoPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {seccModal !== null && (
        <Modal title={seccModal === 'nueva' ? 'Nueva sección' : `Editar sección: ${(seccModal as Seccion).secc_desc}`} onClose={() => setSeccModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <input value={seccForm.secc_desc} onChange={(e) => setSeccForm({ secc_desc: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            {seccError && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{seccError}</p>}
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">
            <button onClick={() => setSeccModal(null)} className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSeccSubmit} disabled={isSeccPending} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
              <Save size={14} />{isSeccPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
