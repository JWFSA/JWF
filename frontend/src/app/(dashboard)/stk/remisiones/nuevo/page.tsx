'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createRemision, getFacturaParaRemitir } from '@/services/stk';
import type { Remision } from '@/types/stk';
import RemisionForm from '@/components/stk/RemisionForm';

export default function NuevaRemisionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const facturaId = searchParams.get('factura');
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: fromFactura, isLoading: loadingFactura } = useQuery({
    queryKey: ['factura-para-remitir', facturaId],
    queryFn: () => getFacturaParaRemitir(Number(facturaId)),
    enabled: !!facturaId,
  });

  const mut = useMutation({
    mutationFn: createRemision,
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['remisiones'] });
      if (facturaId) {
        qc.invalidateQueries({ queryKey: ['facturas'] });
      }
      router.push(`/stk/remisiones/${r.rem_nro}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (facturaId && loadingFactura) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const initialFromFactura: Partial<Remision> | undefined = fromFactura
    ? {
        rem_fec_emis: fromFactura.rem_fec_emis,
        rem_cli: fromFactura.rem_cli,
        cli_nom: fromFactura.cli_nom ?? undefined,
        rem_cli_nom: fromFactura.rem_cli_nom,
        rem_clave_doc: fromFactura.rem_clave_doc,
        items: fromFactura.items,
      }
    : undefined;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nueva remisión</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {fromFactura
            ? `Remitiendo factura #${fromFactura.rem_clave_doc} — seleccione depósito de origen`
            : 'Complete los datos de la remisión'}
        </p>
      </div>
      <RemisionForm
        initial={initialFromFactura}
        isPending={mut.isPending}
        error={error}
        onSave={async (data) => { mut.mutate(data as Partial<Remision>); }}
      />
    </div>
  );
}
