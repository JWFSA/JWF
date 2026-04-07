'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { getCliente, updateCliente } from '@/services/fac';
import ClienteForm, { type ClienteFormData } from '@/components/fac/ClienteForm';

export default function EditarClientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<ClienteFormData | null>(null);
  const [error, setError] = useState('');

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => getCliente(Number(id)),
  });

  useEffect(() => {
    if (!cliente) return;
    setForm({
      cli_nom: cliente.cli_nom ?? '',
      cli_ruc: cliente.cli_ruc ?? '',
      cli_tel: cliente.cli_tel ?? '',
      cli_fax: cliente.cli_fax ?? '',
      cli_email: cliente.cli_email ?? '',
      cli_dir2: cliente.cli_dir2 ?? '',
      cli_localidad: cliente.cli_localidad ?? '',
      cli_zona: cliente.cli_zona ?? '',
      cli_categ: cliente.cli_categ ?? '',
      cli_pais: cliente.cli_pais ?? '',
      cli_est_cli: cliente.cli_est_cli ?? 'A',
      cli_imp_lim_cr: cliente.cli_imp_lim_cr ?? 0,
      cli_bloq_lim_cr: cliente.cli_bloq_lim_cr ?? 'N',
      cli_max_dias_atraso: cliente.cli_max_dias_atraso ?? 0,
      cli_ind_potencial: cliente.cli_ind_potencial ?? 'N',
      cli_obs: cliente.cli_obs ?? '',
      cli_pers_contacto: cliente.cli_pers_contacto ?? '',
      cli_vendedor: cliente.cli_vendedor ?? '',
      cli_cond_venta: cliente.cli_cond_venta ?? '',
    });
  }, [cliente]);

  const updateMut = useMutation({
    mutationFn: (data: Partial<typeof form>) => updateCliente(Number(id), data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['cliente', id] });
      router.push('/fac/clientes');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const handleSubmit = () => {
    if (!form?.cli_nom.trim()) { setError('El nombre es requerido'); return; }
    setError('');
    updateMut.mutate({
      ...form,
      cli_zona:  form.cli_zona  || undefined,
      cli_categ: form.cli_categ || undefined,
      cli_pais:  form.cli_pais  || undefined,
    } as any);
  };

  if (isLoading || !form) {
    return <div className="p-6 text-center text-sm text-gray-400">Cargando...</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Editar cliente</h1>
        <p className="text-sm text-gray-500 mt-0.5">{cliente?.cli_nom} · #{id}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <ClienteForm
          form={form} onChange={setForm} error={error}
          isPending={updateMut.isPending} onSubmit={handleSubmit}
          onCancel={() => router.push('/fac/clientes')} isEdit
        />
      </div>
    </div>
  );
}
