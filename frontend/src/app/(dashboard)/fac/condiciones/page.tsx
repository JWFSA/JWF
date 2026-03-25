'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCondiciones, createCondicion, deleteCondicion } from '@/services/fac';
import DataTable from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import PrimaryAddButton from '@/components/ui/PrimaryAddButton';

export default function CondicionesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ con_desc: '' });
  const [error, setError] = useState('');

  const { data: condiciones = [], isLoading } = useQuery({ queryKey: ['condiciones'], queryFn: getCondiciones });
  const inv = () => qc.invalidateQueries({ queryKey: ['condiciones'] });

  const createMut = useMutation({ mutationFn: createCondicion, onSuccess: () => { inv(); setModal(false); setForm({ con_desc: '' }); }, onError: (e: any) => setError(e?.response?.data?.message ?? 'Error') });
  const deleteMut = useMutation({ mutationFn: deleteCondicion, onSuccess: inv });

  const handleSubmit = () => {
    if (!form.con_desc.trim()) { setError('La descripción es requerida'); return; }
    createMut.mutate(form);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Condiciones de venta</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ej: Contado, 30 días, 60 días</p>
        </div>
        <PrimaryAddButton label="Nueva condición" shortLabel="Nueva" onClick={() => { setForm({ con_desc: '' }); setError(''); setModal(true); }} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <DataTable isLoading={isLoading} rows={condiciones} getRowKey={(c) => c.con_desc}
          onDelete={(c) => deleteMut.mutate(c.con_desc)}
          deleteConfirmMessage="¿Eliminar esta condición de venta?"
          columns={[
            { key: 'desc', header: 'Condición', cell: (c) => c.con_desc, cellClassName: 'font-medium text-gray-800' },
          ]}
        />
      </div>
      {modal && (
        <FormModal title="Nueva condición de venta" onClose={() => setModal(false)}
          onSubmit={handleSubmit} isPending={createMut.isPending} error={error}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input value={form.con_desc} onChange={(e) => setForm({ con_desc: e.target.value })}
              placeholder="Ej: Contado, 30 días, etc."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </FormModal>
      )}
    </div>
  );
}
