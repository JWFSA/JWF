'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrdenCompra, updateOrdenCompra } from '@/services/com';
import type { OrdenCompra } from '@/types/com';
import OrdenCompraForm from '@/components/com/OrdenCompraForm';

export default function EditarOrdenCompraPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: orden, isLoading } = useQuery({
    queryKey: ['ordenes-compra', id],
    queryFn: () => getOrdenCompra(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<OrdenCompra>) => updateOrdenCompra(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ordenes-compra'] });
      router.push('/com/ordenes-compra');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!orden)   return <div className="p-6 text-sm text-red-500">Orden no encontrada</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Editar orden de compra</h1>
        <p className="text-sm text-gray-500 mt-0.5">Nro. {orden.orcom_nro} · {orden.prov_nom ?? '—'}</p>
      </div>
      <OrdenCompraForm
        initialData={orden}
        isPending={mut.isPending}
        error={error}
        onSubmit={(data) => mut.mutate(data as Partial<OrdenCompra>)}
        onCancel={() => router.push('/com/ordenes-compra')}
      />
    </div>
  );
}
