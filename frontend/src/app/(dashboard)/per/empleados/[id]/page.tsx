'use client';

import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEmpleado, updateEmpleado } from '@/services/per';
import type { Empleado } from '@/types/per';
import EmpleadoForm from '@/components/per/EmpleadoForm';
import { showSuccess, showError } from '@/lib/swal';

export default function EditarEmpleadoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data: empleado, isLoading } = useQuery({
    queryKey: ['empleados', id],
    queryFn: () => getEmpleado(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<Empleado>) => updateEmpleado(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empleados'] });
      showSuccess('Empleado actualizado correctamente');
      router.push('/per/empleados');
    },
    onError: (e: any) => {
      showError(e?.response?.data?.message ?? 'Error al guardar');
    },
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!empleado) return <div className="p-6 text-sm text-red-500">Empleado no encontrado</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Editar empleado</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Legajo {empleado.empl_legajo} · {`${empleado.empl_nombre ?? ''} ${empleado.empl_ape ?? ''}`.trim()}
        </p>
      </div>
      <EmpleadoForm
        initial={empleado}
        isPending={mut.isPending}
        onSave={async (data) => { mut.mutate(data as Partial<Empleado>); }}
      />
    </div>
  );
}
