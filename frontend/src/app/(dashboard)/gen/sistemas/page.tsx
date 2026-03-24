'use client';

import { useQuery } from '@tanstack/react-query';
import { getSistemas } from '@/services/gen';
import { Globe, CheckCircle, XCircle } from 'lucide-react';

export default function SistemasPage() {
  const { data, isLoading } = useQuery({ queryKey: ['sistemas'], queryFn: getSistemas });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sistemas / Módulos</h1>
        <p className="text-sm text-gray-500">Módulos disponibles en el ERP</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Abrev.</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : (data || []).map((s) => (
                <tr key={s.sist_codigo} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{s.sist_codigo}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <span className="flex items-center gap-2">
                      <Globe size={14} className="text-orange-400 shrink-0" />
                      {s.sist_desc}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{s.sist_desc_abrev}</td>
                  <td className="px-4 py-3">
                    {s.sist_ind_habilitado === 'S' ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle size={13} /> Habilitado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <XCircle size={13} /> Deshabilitado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
