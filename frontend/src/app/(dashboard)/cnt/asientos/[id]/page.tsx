'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAsiento, updateAsiento } from '@/services/cnt';
import type { Asiento } from '@/types/cnt';
import AsientoForm from '@/components/cnt/AsientoForm';

export default function EditarAsientoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: asiento, isLoading } = useQuery({
    queryKey: ['cnt-asientos', id],
    queryFn: () => getAsiento(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<Asiento>) => updateAsiento(Number(id), data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cnt-asientos'] }); router.push('/cnt/asientos'); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!asiento)  return <div className="p-6 text-sm text-red-500">Asiento no encontrado</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Editar asiento contable</h1>
        <p className="text-sm text-gray-500 mt-0.5">Nro. {asiento.asi_nro} · {asiento.asi_obs ?? '—'}</p>
      </div>
      <AsientoForm initialData={asiento} isPending={mut.isPending} error={error}
        onSubmit={(data) => mut.mutate(data as Partial<Asiento>)}
        onCancel={() => router.push('/cnt/asientos')} />
    </div>
  );
}
