'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRemision } from '@/services/stk';
import type { Remision } from '@/types/stk';
import RemisionForm from '@/components/stk/RemisionForm';

export default function NuevaRemisionPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createRemision,
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['remisiones'] });
      router.push(`/stk/remisiones/${r.rem_nro}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nueva remisión</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos de la remisión</p>
      </div>
      <RemisionForm
        isPending={mut.isPending}
        error={error}
        onSave={async (data) => { mut.mutate(data as Partial<Remision>); }}
      />
    </div>
  );
}
