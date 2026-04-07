'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPresupuesto, updatePresupuesto, convertirPresupuesto } from '@/services/fac';
import type { Pedido } from '@/types/fac';
import PedidoForm from '@/components/fac/PedidoForm';
import { ArrowRightLeft, Printer } from 'lucide-react';

export default function EditarPresupuestoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: presupuesto, isLoading } = useQuery({
    queryKey: ['presupuesto', id],
    queryFn: () => getPresupuesto(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<Pedido>) => updatePresupuesto(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuestos'] });
      qc.invalidateQueries({ queryKey: ['presupuesto', id] });
      router.push('/fac/presupuestos');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const convertirMut = useMutation({
    mutationFn: () => convertirPresupuesto(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuestos'] });
      qc.invalidateQueries({ queryKey: ['pedidos'] });
      router.push('/fac/pedidos');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al convertir'),
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-gray-500">Presupuesto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Presupuesto #{presupuesto.ped_nro}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{presupuesto.cli_nom}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/fac/presupuestos/${presupuesto.ped_clave}/imprimir`)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            <Printer size={16} />
            Imprimir
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('\u00BFConvertir este presupuesto en pedido de venta?')) {
                convertirMut.mutate();
              }
            }}
            disabled={convertirMut.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
          >
            <ArrowRightLeft size={16} />
            {convertirMut.isPending ? 'Convirtiendo\u2026' : 'Convertir a pedido'}
          </button>
        </div>
      </div>
      <PedidoForm
        tipo="P"
        initial={presupuesto}
        onSave={async (data: Partial<Pedido>) => mut.mutate(data)}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
