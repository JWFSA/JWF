'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { getDepositos, createDeposito, updateDeposito, deleteDeposito } from '@/services/stk';
import { getEmpresas, getSucursales } from '@/services/gen';
import type { Deposito } from '@/types/stk';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';

type ModalState = null | 'nuevo' | Deposito;

const emptyCreate = { dep_empr: 0, dep_suc: 0, dep_desc: '' };

export default function DepositosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<{ dep_empr: number; dep_suc: number; dep_desc: string }>(emptyCreate);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['depositos', { page, limit, search: debouncedSearch }],
    queryFn: () => getDepositos({ page, limit, search: debouncedSearch }),
  });

  const { data: empresasData } = useQuery({
    queryKey: ['empresas', { all: true }],
    queryFn: () => getEmpresas({ all: true }),
  });

  const { data: sucursales = [] } = useQuery({
    queryKey: ['sucursales', form.dep_empr],
    queryFn: () => getSucursales(form.dep_empr),
    enabled: modal !== null && form.dep_empr > 0,
  });

  const empresas = empresasData?.data ?? [];
  const depositos = data?.data ?? [];
  const pagination = data?.pagination;

  const uniqueEmprIds = useMemo(
    () => Array.from(new Set(depositos.map((d) => d.dep_empr))).sort((a, b) => a - b),
    [depositos],
  );

  const sucursalesTablaQueries = useQueries({
    queries: uniqueEmprIds.map((emprId) => ({
      queryKey: ['sucursales', emprId],
      queryFn: () => getSucursales(emprId),
    })),
  });

  const empresaNombrePorId = useMemo(() => {
    const m = new Map<number, string>();
    for (const e of empresas) m.set(e.empr_codigo, e.empr_razon_social);
    return m;
  }, [empresas]);

  const sucursalNombrePorEmprSuc = useMemo(() => {
    const m = new Map<string, string>();
    uniqueEmprIds.forEach((emprId, i) => {
      const list = sucursalesTablaQueries[i]?.data;
      if (!list) return;
      for (const s of list) m.set(`${emprId}-${s.suc_codigo}`, s.suc_desc);
    });
    return m;
  }, [uniqueEmprIds, sucursalesTablaQueries]);

  const inv = () => qc.invalidateQueries({ queryKey: ['depositos'] });

  const openNuevo  = () => { setForm(emptyCreate); setError(''); setModal('nuevo'); };
  const openEditar = (d: Deposito) => { setForm({ dep_empr: d.dep_empr, dep_suc: d.dep_suc, dep_desc: d.dep_desc }); setError(''); setModal(d); };

  const createMut = useMutation({
    mutationFn: createDeposito,
    onSuccess: () => { inv(); setModal(null); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ empr, suc, codigo, data }: { empr: number; suc: number; codigo: number; data: Partial<Deposito> }) =>
      updateDeposito(empr, suc, codigo, data),
    onSuccess: () => { inv(); setModal(null); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error'),
  });

  const deleteMut = useMutation({
    mutationFn: ({ empr, suc, codigo }: { empr: number; suc: number; codigo: number }) =>
      deleteDeposito(empr, suc, codigo),
    onSuccess: inv,
  });

  const handleSubmit = () => {
    if (!form.dep_desc.trim()) { setError('La descripción es requerida'); return; }
    if (modal === 'nuevo') {
      if (!form.dep_empr) { setError('La empresa es requerida'); return; }
      if (!form.dep_suc) { setError('La sucursal es requerida'); return; }
      createMut.mutate(form);
    } else {
      const d = modal as Deposito;
      updateMut.mutate({ empr: d.dep_empr, suc: d.dep_suc, codigo: d.dep_codigo, data: { dep_desc: form.dep_desc } });
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Depósitos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Almacenes y depósitos por empresa y sucursal</p>
        </div>
        <PrimaryAddButton label="Nuevo depósito" shortLabel="Nuevo" onClick={openNuevo} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar depósito..." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 hidden md:table-cell">Empresa</th>
                <th className="px-4 py-3 hidden md:table-cell">Sucursal</th>
                <th className="px-4 py-3 w-24">Código</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : depositos.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin resultados</td></tr>
              ) : depositos.map((d) => (
                <tr key={`${d.dep_empr}-${d.dep_suc}-${d.dep_codigo}`} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
                    {empresaNombrePorId.get(d.dep_empr) ?? d.dep_empr}
                  </td>
                  <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
                    {sucursalNombrePorEmprSuc.get(`${d.dep_empr}-${d.dep_suc}`) ?? d.dep_suc}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.dep_codigo}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{d.dep_desc}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditar(d)} className="text-gray-400 hover:text-primary-600 transition"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('?Eliminar este depósito?')) deleteMut.mutate({ empr: d.dep_empr, suc: d.dep_suc, codigo: d.dep_codigo }); }} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <TablePagination
            total={pagination.total}
            page={page}
            limit={limit}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nuevo' ? 'Nuevo depósito' : `Editar: ${(modal as Deposito).dep_desc}`}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
          error={error}
        >
          {modal === 'nuevo' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa <span className="text-red-500">*</span></label>
                <select value={form.dep_empr}
                  onChange={(e) => setForm({ ...form, dep_empr: Number(e.target.value), dep_suc: 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value={0}>Seleccionar empresa...</option>
                  {empresas.map((e) => (
                    <option key={e.empr_codigo} value={e.empr_codigo}>{e.empr_razon_social}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal <span className="text-red-500">*</span></label>
                <select value={form.dep_suc}
                  onChange={(e) => setForm({ ...form, dep_suc: Number(e.target.value) })}
                  disabled={!form.dep_empr}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50">
                  <option value={0}>Seleccionar sucursal...</option>
                  {sucursales.map((s) => (
                    <option key={s.suc_codigo} value={s.suc_codigo}>{s.suc_desc}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.dep_desc} onChange={(e) => setForm({ ...form, dep_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
