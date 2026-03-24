'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createOperador } from '@/services/gen';
import OperadorForm from '@/components/gen/OperadorForm';

export default function NuevoOperadorPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: createOperador,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operadores'] });
      router.push('/gen/operadores');
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nuevo operador</h1>
        <p className="text-sm text-gray-500">Crear un nuevo usuario del sistema</p>
      </div>
      <OperadorForm
        onSubmit={mutation.mutateAsync}
        isLoading={mutation.isPending}
      />
      {mutation.isError && (
        <p className="mt-3 text-sm text-red-600 text-right">
          {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al guardar'}
        </p>
      )}
    </div>
  );
}
