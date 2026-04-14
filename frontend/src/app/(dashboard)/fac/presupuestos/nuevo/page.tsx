'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPresupuesto } from '@/services/fac';
import type { Pedido } from '@/types/fac';
import PedidoForm from '@/components/fac/PedidoForm';

export default function NuevoPresupuestoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createPresupuesto,
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['presupuestos'] });
      router.push(`/fac/presupuestos/${p.ped_clave}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nuevo presupuesto</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos y agregue artículos</p>
      </div>
      <PedidoForm
        tipo="P"
        onSave={async (data: Partial<Pedido>) => mut.mutate(data)}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
