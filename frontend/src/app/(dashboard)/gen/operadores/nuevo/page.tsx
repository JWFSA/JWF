'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createOperador } from '@/services/gen';
import OperadorForm from '@/components/gen/OperadorForm';
import { showSuccess, showError } from '@/lib/swal';

export default function NuevoOperadorPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: createOperador,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operadores'] });
      showSuccess('Operador creado correctamente');
      router.push('/gen/operadores');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      showError(error.response?.data?.message ?? 'Error al crear el operador');
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
    </div>
  );
}
