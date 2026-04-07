'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPedido } from '@/services/fac';
import type { Pedido } from '@/types/fac';
import PedidoForm from '@/components/fac/PedidoForm';

const TIPOS = [
  { value: 'V', label: 'Venta' },
  { value: 'C', label: 'Contrato' },
  { value: 'I', label: 'Interno' },
  { value: 'M', label: 'Muestra' },
  { value: 'D', label: 'Dise\u00f1o' },
];

export default function NuevoPedidoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const tipoInicial = searchParams.get('tipo') ?? 'V';
  const [tipo, setTipo] = useState(tipoInicial);
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: (data: Partial<Pedido>) => createPedido({ ...data, ped_tipo: tipo }),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['pedidos'] });
      router.push(`/fac/pedidos/${p.ped_clave}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Nuevo pedido</h1>
          <p className="text-sm text-gray-500 mt-0.5">Complete los datos y agregue art{'\u00ed'}culos</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Tipo:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <PedidoForm
        tipo={tipo}
        onSave={async (data: Partial<Pedido>) => mut.mutate(data)}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
