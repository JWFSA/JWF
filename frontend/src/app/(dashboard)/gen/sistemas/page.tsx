'use client';

import { useQuery } from '@tanstack/react-query';
import { getSistemas } from '@/services/gen';
import { Globe, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';

export default function SistemasPage() {
  const { data, isLoading } = useQuery({ queryKey: ['sistemas'], queryFn: getSistemas });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sistemas / Módulos</h1>
        <p className="text-sm text-gray-500">Módulos disponibles en el ERP</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          isLoading={isLoading}
          rows={data ?? []}
          getRowKey={(s) => s.sist_codigo}
          tableClassName="w-full text-sm min-w-[400px]"
          columns={[
            { key: 'codigo', header: 'Código', headerClassName: 'w-24', cell: (s) => s.sist_codigo, cellClassName: 'font-mono text-xs text-gray-500' },
            {
              key: 'desc',
              header: 'Descripción',
              cell: (s) => (
                <span className="flex items-center gap-2">
                  <Globe size={14} className="text-orange-400 shrink-0" />
                  {s.sist_desc}
                </span>
              ),
              cellClassName: 'font-medium text-gray-800',
            },
            { key: 'abrev', header: 'Abrev.', headerClassName: 'hidden sm:table-cell', cell: (s) => s.sist_desc_abrev, cellClassName: 'text-gray-500 hidden sm:table-cell' },
            {
              key: 'estado',
              header: 'Estado',
              cell: (s) => s.sist_ind_habilitado === 'S'
                ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle size={13} /> Habilitado</span>
                : <span className="flex items-center gap-1 text-gray-400 text-xs"><XCircle size={13} /> Deshabilitado</span>,
            },
          ]}
        />
      </div>
    </div>
  );
}
