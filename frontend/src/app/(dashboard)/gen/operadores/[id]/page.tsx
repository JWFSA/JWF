'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getOperador, updateOperador } from '@/services/gen';
import OperadorForm from '@/components/gen/OperadorForm';

export default function EditarOperadorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: operador, isLoading } = useQuery({
    queryKey: ['operador', id],
    queryFn: () => getOperador(Number(id)),
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => updateOperador(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operadores'] });
      qc.invalidateQueries({ queryKey: ['operador', id] });
      router.push('/gen/operadores');
    },
  });

  if (isLoading) {
    return <p className="text-sm text-gray-400 p-6">Cargando...</p>;
  }

  if (!operador) {
    return <p className="text-sm text-red-500 p-6">Operador no encontrado.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {operador.oper_nombre} {operador.oper_apellido ?? ''}
        </h1>
        <p className="text-sm text-gray-500">Editar operador · Login: {operador.oper_login}</p>
      </div>
      <OperadorForm
        initial={operador}
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
