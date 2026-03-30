'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAsiento } from '@/services/cnt';
import type { Asiento } from '@/types/cnt';
import AsientoForm from '@/components/cnt/AsientoForm';

export default function NuevoAsientoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createAsiento,
    onSuccess: (a) => { qc.invalidateQueries({ queryKey: ['cnt-asientos'] }); router.push(`/cnt/asientos/${a.asi_clave}`); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nuevo asiento contable</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registrar un nuevo asiento en el libro diario</p>
      </div>
      <AsientoForm isPending={mut.isPending} error={error}
        onSubmit={(data) => mut.mutate(data as Partial<Asiento>)}
        onCancel={() => router.push('/cnt/asientos')} />
    </div>
  );
}
