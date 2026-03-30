'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCuenta } from '@/services/cnt';
import type { Cuenta } from '@/types/cnt';
import CuentaForm from '@/components/cnt/CuentaForm';

export default function NuevaCuentaPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createCuenta,
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ['cnt-cuentas'] }); router.push(`/cnt/cuentas/${c.ctac_clave}`); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nueva cuenta contable</h1>
        <p className="text-sm text-gray-500 mt-0.5">Agregar una cuenta al plan de cuentas</p>
      </div>
      <CuentaForm isPending={mut.isPending} error={error}
        onSubmit={(data) => mut.mutate(data as Partial<Cuenta>)}
        onCancel={() => router.push('/cnt/cuentas')} />
    </div>
  );
}
