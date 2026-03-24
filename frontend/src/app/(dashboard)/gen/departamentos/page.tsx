'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartamentos, createDepartamento, updateDepartamento, deleteDepartamento, getSecciones, createSeccion, updateSeccion, deleteSeccion } from '@/services/gen';
import type { Departamento, Seccion } from '@/types/gen';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';

type DptoModal = null | 'nuevo' | Departamento;
type SeccModal = null | 'nueva' | Seccion;

function matchesDepartamento(d: Departamento, q: string) {
  const s = `${d.dpto_codigo} ${d.dpto_desc}`.toLowerCase();
  return s.includes(q);
}

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

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setExpanded(null);
  }, [page, debouncedSearch]);

  const { data: departamentosRaw = [], isLoading } = useQuery({ queryKey: ['departamentos'], queryFn: getDepartamentos });

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return departamentosRaw as Departamento[];
    return (departamentosRaw as Departamento[]).filter((d) => matchesDepartamento(d, q));
  }, [departamentosRaw, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const departamentos = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, safePage, limit]);

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
        <PrimaryAddButton label="Nuevo departamento" shortLabel="Nuevo" onClick={openNuevoDpto} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar departamento..." />
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">Cargando...</p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">Sin registros</p>
          ) : departamentos.map((d) => (
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

      {dptoModal !== null && (
        <FormModal
          title={dptoModal === 'nuevo' ? 'Nuevo departamento' : `Editar: ${(dptoModal as Departamento).dpto_desc}`}
          onClose={() => setDptoModal(null)}
          onSubmit={handleDptoSubmit}
          isPending={isDptoPending}
          error={dptoError}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={dptoForm.dpto_desc} onChange={(e) => setDptoForm({ dpto_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}

      {seccModal !== null && (
        <FormModal
          title={seccModal === 'nueva' ? 'Nueva sección' : `Editar sección: ${(seccModal as Seccion).secc_desc}`}
          onClose={() => setSeccModal(null)}
          onSubmit={handleSeccSubmit}
          isPending={isSeccPending}
          error={seccError}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={seccForm.secc_desc} onChange={(e) => setSeccForm({ secc_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
