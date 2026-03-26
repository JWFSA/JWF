'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCuentaBancaria, updateCuentaBancaria, getBancos } from '@/services/fin';
import { getMonedas } from '@/services/gen';
import type { CuentaBancaria } from '@/types/fin';
import CuentaBancariaForm from '@/components/fin/CuentaBancariaForm';

export default function EditarCuentaBancariaPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: cuenta, isLoading } = useQuery({
    queryKey: ['cuentas-bancarias', id],
    queryFn: () => getCuentaBancaria(Number(id)),
  });

  const { data: bancosData } = useQuery({ queryKey: ['bancos', { all: true }], queryFn: () => getBancos({ all: true }) });
  const { data: monedasData } = useQuery({ queryKey: ['monedas-all'], queryFn: getMonedas });
  const bancos  = bancosData?.data ?? [];
  const monedas = monedasData ?? [];

  const mut = useMutation({
    mutationFn: (data: Partial<CuentaBancaria>) => updateCuentaBancaria(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cuentas-bancarias'] });
      router.push('/fin/cuentas-bancarias');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!cuenta)   return <div className="p-6 text-sm text-red-500">Cuenta no encontrada</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Editar cuenta bancaria</h1>
        <p className="text-sm text-gray-500 mt-0.5">{cuenta.cta_desc}</p>
      </div>
      <CuentaBancariaForm
        initialData={cuenta}
        bancos={bancos}
        monedas={monedas}
        isPending={mut.isPending}
        error={error}
        onSubmit={(data) => mut.mutate(data as Partial<CuentaBancaria>)}
        onCancel={() => router.push('/fin/cuentas-bancarias')}
      />
    </div>
  );
}
