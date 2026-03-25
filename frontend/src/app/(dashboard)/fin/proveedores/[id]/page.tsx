'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProveedor, updateProveedor } from '@/services/fin';
import type { Proveedor } from '@/types/fin';
import ProveedorForm from '@/components/fin/ProveedorForm';

export default function EditarProveedorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const { data: proveedor, isLoading } = useQuery({
    queryKey: ['proveedor', id],
    queryFn: () => getProveedor(Number(id)),
  });

  const mut = useMutation({
    mutationFn: (data: Partial<Proveedor>) => updateProveedor(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proveedores'] });
      qc.invalidateQueries({ queryKey: ['proveedor', id] });
      router.push('/fin/proveedores');
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!proveedor) {
    return <div className="p-4 sm:p-6"><p className="text-gray-500">Proveedor no encontrado.</p></div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">{proveedor.prov_razon_social}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Código #{proveedor.prov_codigo}</p>
      </div>
      <ProveedorForm
        initial={proveedor}
        onSave={async (data: Partial<Proveedor>) => mut.mutate(data)}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
