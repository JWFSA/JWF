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
    const { cli_emails, ...rest } = form;
    createMut.mutate({
      ...rest,
      cli_email:  cli_emails[0]?.trim() || null,
      cli_email2: cli_emails[1]?.trim() || null,
      cli_email3: cli_emails[2]?.trim() || null,
      cli_email4: cli_emails[3]?.trim() || null,
      cli_zona:     1,
      cli_categ:    form.cli_categ    || null,
      cli_pais:     form.cli_pais     || null,
      cli_vendedor:   form.cli_vendedor   || null,
      cli_cond_venta: form.cli_cond_venta || null,
      cli_nom_fantasia: form.cli_nom_fantasia?.trim().toUpperCase() || null,
      cli_pers_representante: form.cli_pers_representante?.trim().toUpperCase() || null,
      cli_doc_ident_representante: form.cli_doc_ident_representante?.trim() || null,
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
