'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPedido } from '@/services/fac';
import type { Pedido } from '@/types/fac';
import PedidoForm from '@/components/fac/PedidoForm';

export default function NuevoPedidoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createPedido,
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['pedidos'] });
      router.push(`/fac/pedidos/${p.ped_clave}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nuevo pedido</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos y agregue artículos</p>
      </div>
      <PedidoForm
        onSave={async (data: Partial<Pedido>) => mut.mutate(data)}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
