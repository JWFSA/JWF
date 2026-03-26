'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCuentaBancaria } from '@/services/fin';
import { getBancos } from '@/services/fin';
import { getMonedas } from '@/services/gen';
import type { CuentaBancaria } from '@/types/fin';
import CuentaBancariaForm from '@/components/fin/CuentaBancariaForm';

export default function NuevaCuentaBancariaPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: bancosData } = useQuery({ queryKey: ['bancos', { all: true }], queryFn: () => getBancos({ all: true }) });
  const { data: monedasData } = useQuery({ queryKey: ['monedas-all'], queryFn: getMonedas });
  const bancos  = bancosData?.data ?? [];
  const monedas = monedasData ?? [];

  const mut = useMutation({
    mutationFn: createCuentaBancaria,
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['cuentas-bancarias'] });
      router.push(`/fin/cuentas-bancarias/${c.cta_codigo}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nueva cuenta bancaria</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos de la cuenta</p>
      </div>
      <CuentaBancariaForm
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
