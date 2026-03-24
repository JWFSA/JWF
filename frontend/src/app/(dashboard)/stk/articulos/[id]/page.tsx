'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getArticulo } from '@/services/stk';
import ArticuloForm from '@/components/stk/ArticuloForm';

export default function EditarArticuloPage() {
  const { id } = useParams<{ id: string }>();

  const { data: articulo, isLoading, isError } = useQuery({
    queryKey: ['articulo', id],
    queryFn: () => getArticulo(Number(id)),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (isError || !articulo) return <div className="p-6 text-sm text-red-500">Artículo no encontrado.</div>;

  return <ArticuloForm articulo={articulo} />;
}
