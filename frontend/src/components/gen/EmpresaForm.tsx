'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { createEmpresa, updateEmpresa } from '@/services/gen';
import type { Empresa } from '@/types/gen';

const schema = z.object({
  empr_razon_social: z.string().min(1, 'La razón social es requerida'),
  empr_ruc:          z.string().optional().nullable(),
  empr_dir:          z.string().optional().nullable(),
  empr_tel:          z.string().optional().nullable(),
  empr_fax:          z.string().optional().nullable(),
  empr_localidad:    z.string().optional().nullable(),
  empr_correo_elect: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  empr_pagina_web:   z.string().optional().nullable(),
  empr_ind_bloqueado: z.enum(['S', 'N']),
});

type FormData = z.infer<typeof schema>;

export default function EmpresaForm({ empresa }: { empresa?: Empresa }) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = !!empresa;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      empr_razon_social:  empresa?.empr_razon_social ?? '',
      empr_ruc:           empresa?.empr_ruc          ?? '',
      empr_dir:           empresa?.empr_dir          ?? '',
      empr_tel:           empresa?.empr_tel          ?? '',
      empr_fax:           empresa?.empr_fax          ?? '',
      empr_localidad:     empresa?.empr_localidad    ?? '',
      empr_correo_elect:  empresa?.empr_correo_elect ?? '',
      empr_pagina_web:    empresa?.empr_pagina_web   ?? '',
      empr_ind_bloqueado: empresa?.empr_ind_bloqueado ?? 'N',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? updateEmpresa(empresa!.empr_codigo, data) : createEmpresa(data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['empresas'] });
      qc.invalidateQueries({ queryKey: ['empresa', String(result.empr_codigo)] });
      router.push(`/gen/empresas/${result.empr_codigo}`);
    },
  });

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          {isEdit ? `Editar empresa #${empresa!.empr_codigo}` : 'Nueva empresa'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isEdit ? empresa!.empr_razon_social : 'Completá los datos de la nueva empresa'}
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Razón social <span className="text-red-500">*</span></label>
          <input {...register('empr_razon_social')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Nombre o razón social" />
          {errors.empr_razon_social && <p className="text-red-500 text-xs mt-1">{errors.empr_razon_social.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
            <input {...register('empr_ruc')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="RUC de la empresa" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
            <input {...register('empr_localidad')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ciudad / localidad" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input {...register('empr_dir')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Dirección fiscal" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input {...register('empr_tel')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Número de teléfono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
            <input {...register('empr_fax')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Número de fax" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input {...register('empr_correo_elect')} type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="empresa@ejemplo.com" />
            {errors.empr_correo_elect && <p className="text-red-500 text-xs mt-1">{errors.empr_correo_elect.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Página web</label>
            <input {...register('empr_pagina_web')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="www.empresa.com" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select {...register('empr_ind_bloqueado')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="N">Activa</option>
            <option value="S">Bloqueada</option>
          </select>
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {(mutation.error as any)?.response?.data?.message ?? 'Error al guardar'}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Link href="/gen/empresas" className="w-full sm:w-auto text-center px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Cancelar
          </Link>
          <button type="submit" disabled={mutation.isPending}
            className="w-full sm:w-auto px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50">
            {mutation.isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear empresa'}
          </button>
        </div>
      </form>
    </div>
  );
}
