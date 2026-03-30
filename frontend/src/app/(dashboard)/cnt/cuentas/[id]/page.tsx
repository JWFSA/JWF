'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCuenta, updateCuenta } from '@/services/cnt';
import type { Cuenta } from '@/types/cnt';
import CuentaForm from '@/components/cnt/CuentaForm';

export default function EditarCuentaPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: cuenta, isLoading } = useQuery({
    queryKey: ['cnt-cuentas', id],
    queryFn: () => getCuenta(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<Cuenta>) => updateCuenta(Number(id), data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cnt-cuentas'] }); router.push('/cnt/cuentas'); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!cuenta)   return <div className="p-6 text-sm text-red-500">Cuenta no encontrada</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Editar cuenta contable</h1>
        <p className="text-sm text-gray-500 mt-0.5">{cuenta.ctac_nro} · {cuenta.ctac_desc}</p>
      </div>
      <CuentaForm initialData={cuenta} isPending={mut.isPending} error={error}
        onSubmit={(data) => mut.mutate(data as Partial<Cuenta>)}
        onCancel={() => router.push('/cnt/cuentas')} />
    </div>
  );
}
