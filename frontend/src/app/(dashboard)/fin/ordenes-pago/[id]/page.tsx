'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrdenPago, updateOrdenPago } from '@/services/fin';
import type { OrdenPago } from '@/types/fin';
import OrdenPagoForm from '@/components/fin/OrdenPagoForm';

export default function EditarOrdenPagoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: orden, isLoading } = useQuery({
    queryKey: ['ordenes-pago', id],
    queryFn: () => getOrdenPago(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<OrdenPago>) => updateOrdenPago(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ordenes-pago'] });
      router.push('/fin/ordenes-pago');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!orden)   return <div className="p-6 text-sm text-red-500">Orden no encontrada</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Editar orden de pago</h1>
        <p className="text-sm text-gray-500 mt-0.5">Nro. {orden.ordp_codigo} · {orden.ordp_beneficiario ?? orden.prov_nom ?? '—'}</p>
      </div>
      <OrdenPagoForm
        initialData={orden}
        isPending={mut.isPending}
        error={error}
        onSubmit={(data) => mut.mutate(data as Partial<OrdenPago>)}
        onCancel={() => router.push('/fin/ordenes-pago')}
      />
    </div>
  );
}
