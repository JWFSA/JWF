'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContratoProv } from '@/services/com';
import type { ContratoProv } from '@/types/com';
import ContratoProvForm from '@/components/com/ContratoProvForm';

export default function NuevoContratoProvPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createContratoProv,
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['contratos-prov'] });
      router.push(`/com/contratos/${c.cont_clave}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nuevo contrato de proveedor</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos del contrato</p>
      </div>
      <ContratoProvForm
        isPending={mut.isPending}
        error={error}
        onSubmit={(data) => mut.mutate(data as Partial<ContratoProv>)}
        onCancel={() => router.push('/com/contratos')}
      />
    </div>
  );
}
