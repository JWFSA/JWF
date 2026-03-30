'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrdenCompra } from '@/services/com';
import type { OrdenCompra } from '@/types/com';
import OrdenCompraForm from '@/components/com/OrdenCompraForm';

export default function NuevaOrdenCompraPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createOrdenCompra,
    onSuccess: (o) => {
      qc.invalidateQueries({ queryKey: ['ordenes-compra'] });
      router.push(`/com/ordenes-compra/${o.orcom_nro}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nueva orden de compra</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos de la orden</p>
      </div>
      <OrdenCompraForm
        isPending={mut.isPending}
        error={error}
        onSubmit={(data) => mut.mutate(data as Partial<OrdenCompra>)}
        onCancel={() => router.push('/com/ordenes-compra')}
      />
    </div>
  );
}
