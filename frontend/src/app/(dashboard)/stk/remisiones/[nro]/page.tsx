'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRemision, updateRemision } from '@/services/stk';
import type { Remision } from '@/types/stk';
import RemisionForm from '@/components/stk/RemisionForm';

export default function EditarRemisionPage() {
  const router = useRouter();
  const { nro } = useParams<{ nro: string }>();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: remision, isLoading } = useQuery({
    queryKey: ['remisiones', nro],
    queryFn: () => getRemision(Number(nro)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<Remision>) => updateRemision(Number(nro), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['remisiones'] });
      router.push('/stk/remisiones');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!remision) return <div className="p-6 text-sm text-red-500">Remisión no encontrada</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Editar remisión</h1>
        <p className="text-sm text-gray-500 mt-0.5">Nro. {remision.rem_nro} · {remision.cli_nom ?? '—'}</p>
      </div>
      <RemisionForm
        initial={remision}
        isPending={mut.isPending}
        error={error}
        onSave={async (data) => { mut.mutate(data as Partial<Remision>); }}
      />
    </div>
  );
}
