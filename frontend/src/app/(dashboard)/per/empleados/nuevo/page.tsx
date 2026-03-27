'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEmpleado } from '@/services/per';
import type { Empleado } from '@/types/per';
import EmpleadoForm from '@/components/per/EmpleadoForm';

export default function NuevoEmpleadoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createEmpleado,
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['empleados'] });
      router.push(`/per/empleados/${r.empl_legajo}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nuevo empleado</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos del empleado</p>
      </div>
      <EmpleadoForm
        isPending={mut.isPending}
        error={error}
        onSave={async (data) => { mut.mutate(data as Partial<Empleado>); }}
      />
    </div>
  );
}
