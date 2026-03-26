'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrdenPago } from '@/services/fin';
import type { OrdenPago } from '@/types/fin';
import OrdenPagoForm from '@/components/fin/OrdenPagoForm';

export default function NuevaOrdenPagoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createOrdenPago,
    onSuccess: (o) => {
      qc.invalidateQueries({ queryKey: ['ordenes-pago'] });
      router.push(`/fin/ordenes-pago/${o.ordp_clave}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nueva orden de pago</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos de la orden</p>
      </div>
      <OrdenPagoForm
        isPending={mut.isPending}
        error={error}
        onSubmit={(data) => mut.mutate(data as Partial<OrdenPago>)}
        onCancel={() => router.push('/fin/ordenes-pago')}
      />
    </div>
  );
}
