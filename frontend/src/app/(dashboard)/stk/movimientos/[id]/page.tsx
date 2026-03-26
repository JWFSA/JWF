'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMovimiento, updateMovimiento } from '@/services/stk';
import type { Movimiento } from '@/types/stk';
import MovimientoForm from '@/components/stk/MovimientoForm';

export default function EditarMovimientoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: movimiento, isLoading } = useQuery({
    queryKey: ['movimientos', id],
    queryFn: () => getMovimiento(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<Movimiento>) => updateMovimiento(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientos'] });
      router.push('/stk/movimientos');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!movimiento) return <div className="p-6 text-sm text-red-500">Movimiento no encontrado</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Editar movimiento de stock</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Nro. {movimiento.docu_nro_doc} · {movimiento.oper_desc ?? '—'}
        </p>
      </div>
      <MovimientoForm
        initial={movimiento}
        isPending={mut.isPending}
        error={error}
        onSave={async (data) => mut.mutate(data as Partial<Movimiento>)}
      />
    </div>
  );
}
