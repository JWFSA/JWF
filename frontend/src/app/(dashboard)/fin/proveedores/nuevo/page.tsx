'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProveedor } from '@/services/fin';
import type { Proveedor } from '@/types/fin';
import ProveedorForm from '@/components/fin/ProveedorForm';

export default function NuevoProveedorPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: createProveedor,
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['proveedores'] });
      router.push(`/fin/proveedores/${p.prov_codigo}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Nuevo proveedor</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete los datos del proveedor</p>
      </div>
      <ProveedorForm
        onSave={async (data: Partial<Proveedor>) => mut.mutate(data)}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
