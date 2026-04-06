'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFactura, updateFactura } from '@/services/fac';
import type { Factura } from '@/types/fac';
import FacturaForm from '@/components/fac/FacturaForm';
import { Truck } from 'lucide-react';

export default function EditarFacturaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: factura, isLoading } = useQuery({
    queryKey: ['factura', id],
    queryFn: () => getFactura(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<Factura>) => updateFactura(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['facturas'] });
      qc.invalidateQueries({ queryKey: ['factura', id] });
      router.push('/fac/facturas');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!factura) return <div className="p-6 text-sm text-red-500">Factura no encontrada</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Editar factura #{factura.doc_nro_doc}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Modifique los datos de la factura</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/stk/remisiones/nuevo?factura=${factura.doc_clave}`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <Truck size={16} />
          Remitir
        </button>
      </div>
      <FacturaForm
        initial={factura}
        onSave={async (data: Partial<Factura>) => mut.mutate(data)}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
