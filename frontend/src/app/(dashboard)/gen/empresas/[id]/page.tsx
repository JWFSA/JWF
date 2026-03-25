'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getEmpresa, getSucursales, createSucursal, updateSucursal, deleteSucursal } from '@/services/gen';
import type { Sucursal } from '@/types/gen';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Building2, Phone, MapPin, Star, Pencil, Plus, X, Save } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}

type SucursalForm = { suc_desc: string; suc_dir: string; suc_tel: string; suc_fax: string; suc_localidad: string; suc_ind_casa_central: 'S' | 'N' };
const emptyForm: SucursalForm = { suc_desc: '', suc_dir: '', suc_tel: '', suc_fax: '', suc_localidad: '', suc_ind_casa_central: 'N' };

export default function EmpresaPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: empresa, isLoading } = useQuery({
    queryKey: ['empresa', id],
    queryFn: () => getEmpresa(Number(id)),
  });

  const { data: sucursales = [] } = useQuery({
    queryKey: ['sucursales', Number(id)],
    queryFn: () => getSucursales(Number(id)),
    enabled: !!id,
  });

  const [modal, setModal] = useState<null | 'nueva' | Sucursal>(null);
  const [form, setForm] = useState<SucursalForm>(emptyForm);
  const [formError, setFormError] = useState('');

  const openNueva = () => { setForm(emptyForm); setFormError(''); setModal('nueva'); };
  const openEditar = (s: Sucursal) => {
    setForm({ suc_desc: s.suc_desc, suc_dir: s.suc_dir ?? '', suc_tel: s.suc_tel ?? '', suc_fax: s.suc_fax ?? '', suc_localidad: s.suc_localidad ?? '', suc_ind_casa_central: s.suc_ind_casa_central ?? 'N' });
    setFormError('');
    setModal(s);
  };

  const invalidate = () => qc.invalidateQueries({ queryKey: ['sucursales', Number(id)] });

  const createMut = useMutation({
    mutationFn: (data: SucursalForm) => createSucursal(Number(id), data),
    onSuccess: () => { invalidate(); setModal(null); },
    onError: (e: any) => setFormError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const updateMut = useMutation({
    mutationFn: (data: SucursalForm) => updateSucursal(Number(id), (modal as Sucursal).suc_codigo, data),
    onSuccess: () => { invalidate(); setModal(null); },
    onError: (e: any) => setFormError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const deleteMut = useMutation({
    mutationFn: (sucId: number) => deleteSucursal(Number(id), sucId),
    onSuccess: () => invalidate(),
  });

  const handleSubmit = () => {
    if (!form.suc_desc.trim()) { setFormError('La descripción es requerida'); return; }
    modal === 'nueva' ? createMut.mutate(form) : updateMut.mutate(form);
  };

  if (isLoading) return <p className="text-sm text-gray-400 p-6">Cargando...</p>;
  if (!empresa) return <p className="text-sm text-red-500 p-6">Empresa no encontrada.</p>;

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/gen/empresas" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{empresa.empr_razon_social}</h1>
            <p className="text-sm text-gray-500">Ficha de empresa</p>
          </div>
          {empresa.empr_ind_bloqueado === 'S' && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Bloqueada</span>
          )}
        </div>
        <Link href={`/gen/empresas/${id}/editar`}
          className="inline-flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 transition">
          <Pencil size={14} /> <span className="hidden sm:inline">Editar</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Building2 size={15} /> Datos generales</h2>
          <div className="space-y-3">
            <Field label="Razón social" value={empresa.empr_razon_social} />
            <Field label="RUC" value={empresa.empr_ruc} />
            <Field label="Localidad" value={empresa.empr_localidad} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Phone size={15} /> Contacto</h2>
          <div className="space-y-3">
            <Field label="Dirección" value={empresa.empr_dir} />
            <Field label="Teléfono" value={empresa.empr_tel} />
            <Field label="Fax" value={empresa.empr_fax} />
            <Field label="Correo electrónico" value={empresa.empr_correo_elect} />
            <Field label="Página web" value={empresa.empr_pagina_web} />
          </div>
        </div>
      </div>

      {/* Sucursales */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MapPin size={15} /> Sucursales ({sucursales.length})
          </h2>
          <button onClick={openNueva}
            className="inline-flex items-center gap-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg transition">
            <Plus size={13} /> Nueva sucursal
          </button>
        </div>

        <DataTable
          isLoading={false}
          rows={sucursales}
          getRowKey={(s) => s.suc_codigo}
          onEdit={openEditar}
          onDelete={(s) => deleteMut.mutate(s.suc_codigo)}
          deleteConfirmMessage="¿Eliminar esta sucursal?"
          emptyLabel="Sin sucursales registradas."
          tableClassName="w-full text-sm min-w-[400px]"
          columns={[
            { key: 'codigo', header: 'Cód.', headerClassName: 'w-16', cell: (s) => s.suc_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
            {
              key: 'desc',
              header: 'Nombre',
              cell: (s) => (
                <span className="flex items-center gap-2">
                  {s.suc_desc}
                  {s.suc_ind_casa_central === 'S' && (
                    <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full shrink-0">
                      <Star size={10} /> Casa central
                    </span>
                  )}
                </span>
              ),
              cellClassName: 'font-medium text-gray-800',
            },
            { key: 'dir', header: 'Dirección', headerClassName: 'hidden md:table-cell', cell: (s) => s.suc_dir ?? '—', cellClassName: 'text-gray-500 hidden md:table-cell' },
            { key: 'tel', header: 'Teléfono', headerClassName: 'hidden md:table-cell', cell: (s) => s.suc_tel ?? '—', cellClassName: 'text-gray-500 hidden md:table-cell' },
            { key: 'localidad', header: 'Localidad', headerClassName: 'hidden lg:table-cell', cell: (s) => s.suc_localidad ?? '—', cellClassName: 'text-gray-400 hidden lg:table-cell' },
          ]}
        />
      </div>

      {/* Modal sucursal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-800">
                {modal === 'nueva' ? 'Nueva sucursal' : `Editar: ${(modal as Sucursal).suc_desc}`}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                <input value={form.suc_desc} onChange={(e) => setForm({ ...form, suc_desc: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nombre de la sucursal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input value={form.suc_dir} onChange={(e) => setForm({ ...form, suc_dir: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input value={form.suc_tel} onChange={(e) => setForm({ ...form, suc_tel: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
                  <input value={form.suc_fax} onChange={(e) => setForm({ ...form, suc_fax: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
                <input value={form.suc_localidad} onChange={(e) => setForm({ ...form, suc_localidad: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="casa_central" checked={form.suc_ind_casa_central === 'S'}
                  onChange={(e) => setForm({ ...form, suc_ind_casa_central: e.target.checked ? 'S' : 'N' })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="casa_central" className="text-sm text-gray-700">Casa central</label>
              </div>
            </div>

            {formError && <p className="text-red-500 text-sm mt-3 bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</p>}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">
              <button onClick={() => setModal(null)} className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSubmit} disabled={isPending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50">
                <Save size={14} />{isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
