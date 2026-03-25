'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPedido, updatePedido } from '@/services/fac';
import type { Pedido } from '@/types/fac';
import PedidoForm from '@/components/fac/PedidoForm';

export default function EditarPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: pedido, isLoading } = useQuery({
    queryKey: ['pedido', id],
    queryFn: () => getPedido(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<Pedido>) => updatePedido(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedidos'] });
      qc.invalidateQueries({ queryKey: ['pedido', id] });
      router.push('/fac/pedidos');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-gray-500">Pedido no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Pedido #{pedido.ped_nro}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{pedido.cli_nom}</p>
      </div>
      <PedidoForm
        initial={pedido}
        onSave={async (data: Partial<Pedido>) => mut.mutate(data)}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
