'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTiposImpuesto, createTipoImpuesto, updateTipoImpuesto, deleteTipoImpuesto } from '@/services/gen';
import type { TipoImpuesto } from '@/types/gen';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';

type ModalState = null | 'nuevo' | TipoImpuesto;
const empty = { timpu_desc: '', timpu_iva_n: 'N' as 'S'|'N', timpu_irp_rps_n: 'N' as 'S'|'N', timpu_ire_simple_n: 'N' as 'S'|'N', timpu_ind_imputa_exenta: 'N' as 'S'|'N', timpu_ind_imputa: 'N' as 'S'|'N' };

function Chip({ active }: { active: boolean }) {
  return active
    ? <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Sí</span>
    : <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-400">No</span>;
}

export default function TiposImpuestoPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [error, setError] = useState('');

  const { data: tipos = [], isLoading } = useQuery({ queryKey: ['tipos-impuesto'], queryFn: getTiposImpuesto });
  const inv = () => qc.invalidateQueries({ queryKey: ['tipos-impuesto'] });

  const openNuevo  = () => { setForm(empty); setError(''); setModal('nuevo'); };
  const openEditar = (t: TipoImpuesto) => {
    setForm({ timpu_desc: t.timpu_desc, timpu_iva_n: t.timpu_iva_n, timpu_irp_rps_n: t.timpu_irp_rps_n, timpu_ire_simple_n: t.timpu_ire_simple_n, timpu_ind_imputa_exenta: t.timpu_ind_imputa_exenta, timpu_ind_imputa: t.timpu_ind_imputa });
    setError(''); setModal(t);
  };

  const createMut = useMutation({ mutationFn: createTipoImpuesto, onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateTipoImpuesto(id, data), onSuccess: () => { inv(); setModal(null); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteTipoImpuesto, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.timpu_desc.trim()) { setError('La descripción es requerida'); return; }
    modal === 'nuevo' ? createMut.mutate(form) : updateMut.mutate({ id: (modal as TipoImpuesto).timpu_codigo, data: form });
  };

  const chk = (field: keyof typeof empty) => (
    <div key={field} className="flex items-center gap-2">
      <input type="checkbox" id={field} checked={form[field] === 'S'}
        onChange={(e) => setForm({ ...form, [field]: e.target.checked ? 'S' : 'N' })}
        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
      <label htmlFor={field} className="text-sm text-gray-700">{labels[field]}</label>
    </div>
  );

  const labels: Record<string, string> = {
    timpu_iva_n: 'IVA', timpu_irp_rps_n: 'IRP / RPS', timpu_ire_simple_n: 'IRE Simplificado',
    timpu_ind_imputa_exenta: 'Imputa exenta', timpu_ind_imputa: 'Imputa',
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tipos de impuesto</h1>
          <p className="text-sm text-gray-500 mt-0.5">Clasificación de impuestos por tipo</p>
        </div>
        <PrimaryAddButton label="Nuevo tipo" shortLabel="Nuevo" onClick={openNuevo} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <DataTable
          isLoading={isLoading}
          rows={tipos}
          getRowKey={(t) => t.timpu_codigo}
          onEdit={openEditar}
          onDelete={(t) => deleteMut.mutate(t.timpu_codigo)}
          deleteConfirmMessage="¿Eliminar este tipo de impuesto?"
          tableClassName="w-full min-w-[600px] text-sm"
          columns={[
            { key: 'codigo', header: 'Cód.', headerClassName: 'w-16', cell: (t) => t.timpu_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
            { key: 'desc', header: 'Descripción', cell: (t) => t.timpu_desc, cellClassName: 'font-medium text-gray-800' },
            { key: 'iva', header: 'IVA', headerClassName: 'hidden md:table-cell text-center w-16', cell: (t) => <Chip active={t.timpu_iva_n === 'S'} />, cellClassName: 'hidden md:table-cell text-center' },
            { key: 'irp', header: 'IRP/RPS', headerClassName: 'hidden md:table-cell text-center w-20', cell: (t) => <Chip active={t.timpu_irp_rps_n === 'S'} />, cellClassName: 'hidden md:table-cell text-center' },
            { key: 'ire', header: 'IRE', headerClassName: 'hidden lg:table-cell text-center w-16', cell: (t) => <Chip active={t.timpu_ire_simple_n === 'S'} />, cellClassName: 'hidden lg:table-cell text-center' },
            { key: 'exenta', header: 'Imp. exenta', headerClassName: 'hidden lg:table-cell text-center w-24', cell: (t) => <Chip active={t.timpu_ind_imputa_exenta === 'S'} />, cellClassName: 'hidden lg:table-cell text-center' },
          ]}
        />
      </div>

      {modal !== null && (
        <FormModal
          title={modal === 'nuevo' ? 'Nuevo tipo de impuesto' : `Editar: ${(modal as TipoImpuesto).timpu_desc}`}
          onClose={() => setModal(null)} onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending} error={error}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.timpu_desc} onChange={(e) => setForm({ ...form, timpu_desc: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Indicadores</p>
            {(['timpu_iva_n', 'timpu_irp_rps_n', 'timpu_ire_simple_n', 'timpu_ind_imputa_exenta', 'timpu_ind_imputa'] as const).map(chk)}
          </div>
        </FormModal>
      )}
    </div>
  );
}
