'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getContratoProv, updateContratoProv } from '@/services/com';
import type { ContratoProv } from '@/types/com';
import ContratoProvForm from '@/components/com/ContratoProvForm';

export default function EditarContratoProvPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: contrato, isLoading } = useQuery({
    queryKey: ['contratos-prov', id],
    queryFn: () => getContratoProv(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<ContratoProv>) => updateContratoProv(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contratos-prov'] });
      router.push('/com/contratos');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!contrato) return <div className="p-6 text-sm text-red-500">Contrato no encontrado</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Editar contrato de proveedor</h1>
        <p className="text-sm text-gray-500 mt-0.5">Nro. {contrato.cont_numero} · {contrato.prov_nom ?? '—'}</p>
      </div>
      <ContratoProvForm
        initialData={contrato}
        isPending={mut.isPending}
        error={error}
        onSubmit={(data) => mut.mutate(data as Partial<ContratoProv>)}
        onCancel={() => router.push('/com/contratos')}
      />
    </div>
  );
}
