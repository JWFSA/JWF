'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getEmpresa } from '@/services/gen';
import EmpresaForm from '@/components/gen/EmpresaForm';

export default function EditarEmpresaPage() {
  const { id } = useParams<{ id: string }>();

  const { data: empresa, isLoading, isError } = useQuery({
    queryKey: ['empresa', id],
    queryFn: () => getEmpresa(Number(id)),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Cargando...</div>;
  if (isError || !empresa) return <div className="p-6 text-sm text-red-500">Empresa no encontrada.</div>;

  return <EmpresaForm empresa={empresa} />;
}
