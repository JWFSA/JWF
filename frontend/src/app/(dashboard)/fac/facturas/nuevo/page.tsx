'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFactura } from '@/services/fac';
import type { Factura } from '@/types/fac';
import FacturaForm from '@/components/fac/FacturaForm';

export default function NuevaFacturaPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createFactura,
    onSuccess: (f) => {
      qc.invalidateQueries({ queryKey: ['facturas'] });
      router.push(`/fac/facturas/${f.doc_clave}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nueva factura</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos y agregue artículos</p>
      </div>
      <FacturaForm
        onSave={async (data: Partial<Factura>) => mut.mutate(data)}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
