'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMovimiento } from '@/services/stk';
import type { Movimiento } from '@/types/stk';
import MovimientoForm from '@/components/stk/MovimientoForm';

export default function NuevoMovimientoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createMovimiento,
    onSuccess: (m) => {
      qc.invalidateQueries({ queryKey: ['movimientos'] });
      router.push(`/stk/movimientos/${m.docu_clave}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nuevo movimiento de stock</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos del movimiento</p>
      </div>
      <MovimientoForm
        isPending={mut.isPending}
        error={error}
        onSave={async (data) => mut.mutate(data as Partial<Movimiento>)}
      />
    </div>
  );
}
