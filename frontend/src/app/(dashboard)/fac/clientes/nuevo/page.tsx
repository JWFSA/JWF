'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createCliente } from '@/services/fac';
import ClienteForm, { emptyCliente, type ClienteFormData } from '@/components/fac/ClienteForm';

export default function NuevoClientePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<ClienteFormData>(emptyCliente);
  const [error, setError] = useState('');

  const createMut = useMutation({
    mutationFn: createCliente,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      router.push(`/fac/clientes/${data.cli_codigo}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al crear el cliente'),
  });

  const handleSubmit = () => {
    if (!form.cli_nom.trim()) { setError('El nombre es requerido'); return; }
    setError('');
    createMut.mutate({
      ...form,
      cli_zona:  form.cli_zona  || null,
      cli_categ: form.cli_categ || null,
      cli_pais:  form.cli_pais  || null,
      cli_mon:   form.cli_mon   || null,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nuevo cliente</h1>
        <p className="text-sm text-gray-500 mt-0.5">Completá los datos del nuevo cliente</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <ClienteForm
          form={form} onChange={setForm} error={error}
          isPending={createMut.isPending} onSubmit={handleSubmit}
          onCancel={() => router.push('/fac/clientes')}
        />
      </div>
    </div>
  );
}
