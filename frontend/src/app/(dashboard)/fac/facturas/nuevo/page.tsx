'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFactura, getPedidoParaFacturar } from '@/services/fac';
import type { Factura } from '@/types/fac';
import FacturaForm from '@/components/fac/FacturaForm';

export default function NuevaFacturaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get('pedido');
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: fromPedido, isLoading: loadingPedido } = useQuery({
    queryKey: ['pedido-para-facturar', pedidoId],
    queryFn: () => getPedidoParaFacturar(Number(pedidoId)),
    enabled: !!pedidoId,
  });

  const mut = useMutation({
    mutationFn: createFactura,
    onSuccess: (f) => {
      qc.invalidateQueries({ queryKey: ['facturas'] });
      if (pedidoId) {
        qc.invalidateQueries({ queryKey: ['pedidos'] });
        qc.invalidateQueries({ queryKey: ['pedido', pedidoId] });
      }
      router.push(`/fac/facturas/${f.doc_clave}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const handleSave = async (data: Partial<Factura>) => {
    // Adjuntar ped_clave para que el backend vincule y actualice estado
    if (fromPedido?.ped_clave) {
      (data as any).ped_clave = fromPedido.ped_clave;
    }
    mut.mutate(data);
  };

  if (pedidoId && loadingPedido) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Transformar datos del pedido al formato de Factura para initial
  const initialFromPedido: Partial<Factura> | undefined = fromPedido
    ? {
        doc_fec_doc: fromPedido.doc_fec_doc,
        doc_cli: fromPedido.doc_cli,
        cli_nom: fromPedido.cli_nom,
        doc_cli_nom: fromPedido.doc_cli_nom,
        doc_cli_ruc: fromPedido.doc_cli_ruc,
        doc_cond_vta: fromPedido.doc_cond_vta,
        doc_mon: fromPedido.doc_mon,
        doc_obs: fromPedido.doc_obs,
        items: fromPedido.items,
      }
    : undefined;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nueva factura</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {fromPedido
            ? `Facturando pedido #${fromPedido.ped_clave} — revise los datos y ajuste el IVA`
            : 'Complete los datos y agregue artículos'}
        </p>
      </div>
      <FacturaForm
        initial={initialFromPedido}
        onSave={handleSave}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
