'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { createArticulo, updateArticulo, getLineas, getMarcas, getRubros, getUnidadesMedida } from '@/services/stk';
import type { Articulo } from '@/types/stk';

const schema = z.object({
  art_desc:          z.string().min(1, 'La descripción es requerida').max(100),
  art_desc_abrev:    z.string().max(20).optional().nullable(),
  art_codigo_fabrica:z.string().max(20).optional().nullable(),
  art_unid_med:      z.string().optional().nullable(),
  art_linea:         z.string().optional().nullable(),
  art_marca:         z.string().optional().nullable(),
  art_rubro:         z.string().optional().nullable(),
  art_est:           z.enum(['A', 'I']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  articulo?: Articulo;
}

export default function ArticuloForm({ articulo }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!articulo;

  const { data: lineasData, isLoading: loadingLineas }  = useQuery({ queryKey: ['lineas', { all: true }],  queryFn: () => getLineas({ all: true }) });
  const { data: marcasData, isLoading: loadingMarcas }  = useQuery({ queryKey: ['marcas', { all: true }],  queryFn: () => getMarcas({ all: true }) });
  const { data: rubrosData, isLoading: loadingRubros }  = useQuery({ queryKey: ['rubros', { all: true }],  queryFn: () => getRubros({ all: true }) });
  const { data: umedData, isLoading: loadingUmed }      = useQuery({ queryKey: ['unidades-medida'],         queryFn: () => getUnidadesMedida({ all: true }) });

  const lineas  = lineasData?.data  ?? [];
  const marcas  = marcasData?.data  ?? [];
  const rubros  = rubrosData?.data  ?? [];
  const unidades = umedData?.data   ?? [];

  const loadingCatalogs = loadingLineas || loadingMarcas || loadingRubros || loadingUmed;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      art_desc:           articulo?.art_desc ?? '',
      art_desc_abrev:     articulo?.art_desc_abrev ?? '',
      art_codigo_fabrica: articulo?.art_codigo_fabrica ?? '',
      art_unid_med:       articulo?.art_unid_med ?? '',
      art_linea:          articulo?.art_linea != null ? String(articulo.art_linea) : '',
      art_marca:          articulo?.art_marca != null ? String(articulo.art_marca) : '',
      art_rubro:          articulo?.art_rubro != null ? String(articulo.art_rubro) : '',
      art_est:            articulo?.art_est ?? 'A',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        art_linea: data.art_linea ? Number(data.art_linea) : null,
        art_marca: data.art_marca ? Number(data.art_marca) : null,
        art_rubro: data.art_rubro ? Number(data.art_rubro) : null,
      };
      return isEdit
        ? updateArticulo(articulo!.art_codigo, payload)
        : createArticulo(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articulos'] });
      router.push('/stk/articulos');
    },
  });

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          {isEdit ? `Editar artículo #${articulo!.art_codigo}` : 'Nuevo artículo'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isEdit ? articulo!.art_desc : 'Completá los datos del nuevo artículo'}
        </p>
      </div>

      {loadingCatalogs ? (
        <div className="text-sm text-gray-500">Cargando datos...</div>
      ) : (
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
          <input
            {...register('art_desc')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Descripción completa del artículo"
          />
          {errors.art_desc && <p className="text-red-500 text-xs mt-1">{errors.art_desc.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Descripción abreviada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción abreviada</label>
            <input
              {...register('art_desc_abrev')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Hasta 20 caracteres"
              maxLength={20}
            />
          </div>

          {/* Código de fábrica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de fábrica</label>
            <input
              {...register('art_codigo_fabrica')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Código del fabricante"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unidad de medida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de medida</label>
            <select {...register('art_unid_med')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Sin unidad —</option>
              {unidades.map((u) => <option key={u.um_codigo} value={u.um_codigo}>{u.um_codigo}</option>)}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select {...register('art_est')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Línea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Línea</label>
            <select {...register('art_linea')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Sin línea —</option>
              {lineas.map((l) => <option key={l.lin_codigo} value={l.lin_codigo}>{l.lin_desc}</option>)}
            </select>
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <select {...register('art_marca')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Sin marca —</option>
              {marcas.map((m) => <option key={m.marc_codigo} value={m.marc_codigo}>{m.marc_desc}</option>)}
            </select>
          </div>

          {/* Rubro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rubro</label>
            <select {...register('art_rubro')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Sin rubro —</option>
              {rubros.map((r) => <option key={r.rub_codigo} value={r.rub_codigo}>{r.rub_desc}</option>)}
            </select>
          </div>
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {(mutation.error as any)?.response?.data?.message ?? 'Error al guardar'}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Link href="/stk/articulos" className="w-full sm:w-auto text-center px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full sm:w-auto px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {mutation.isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear artículo'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
