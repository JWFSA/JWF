'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getEmpresa, getSucursales } from '@/services/gen';
import Link from 'next/link';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Hash, Star } from 'lucide-react';

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}

export default function EmpresaPage() {
  const { id } = useParams<{ id: string }>();

  const { data: empresa, isLoading } = useQuery({
    queryKey: ['empresa', id],
    queryFn: () => getEmpresa(Number(id)),
  });

  const { data: sucursales = [] } = useQuery({
    queryKey: ['sucursales', Number(id)],
    queryFn: () => getSucursales(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <p className="text-sm text-gray-400 p-6">Cargando...</p>;
  if (!empresa) return <p className="text-sm text-red-500 p-6">Empresa no encontrada.</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/gen/empresas" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{empresa.empr_razon_social}</h1>
          <p className="text-sm text-gray-500">Ficha de empresa</p>
        </div>
        {empresa.empr_ind_bloqueado === 'S' && (
          <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Bloqueada</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Datos generales */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Building2 size={15} /> Datos generales
          </h2>
          <div className="space-y-3">
            <Field label="Razón social" value={empresa.empr_razon_social} />
            <Field label="RUC" value={empresa.empr_ruc} />
            <Field label="Localidad" value={empresa.empr_localidad} />
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Phone size={15} /> Contacto
          </h2>
          <div className="space-y-3">
            <Field label="Dirección" value={empresa.empr_dir} />
            <Field label="Teléfono" value={empresa.empr_tel} />
            <Field label="Correo electrónico" value={empresa.empr_correo_elect} />
            <Field label="Página web" value={empresa.empr_pagina_web} />
          </div>
        </div>
      </div>

      {/* Sucursales */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <MapPin size={15} /> Sucursales ({sucursales.length})
        </h2>
        {sucursales.length === 0 ? (
          <p className="text-sm text-gray-400">Sin sucursales registradas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sucursales.map((s) => (
              <div
                key={s.suc_codigo}
                className="border border-gray-100 rounded-lg p-4 text-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-gray-800">{s.suc_desc}</p>
                  {s.suc_ind_casa_central === 'S' && (
                    <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                      <Star size={10} /> Casa central
                    </span>
                  )}
                </div>
                {s.suc_dir && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} />{s.suc_dir}</p>}
                {s.suc_tel && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={11} />{s.suc_tel}</p>}
                {s.suc_localidad && <p className="text-xs text-gray-400 mt-0.5">{s.suc_localidad}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
