'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getLiquidacion } from '@/services/per';
import { formatDate } from '@/lib/utils';

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

export default function LiquidacionDetallePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: liq, isLoading } = useQuery({
    queryKey: ['per-liquidaciones', id],
    queryFn: () => getLiquidacion(Number(id)),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!liq)      return <div className="p-6 text-sm text-red-500">Liquidación no encontrada</div>;

  const nombre = `${liq.empl_nombre ?? ''} ${liq.empl_ape ?? ''}`.trim();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Liquidación</h1>
          <p className="text-sm text-gray-500 mt-0.5">{nombre} · {formatDate(liq.pdoc_fec)} · Período {liq.pdoc_periodo} Q{liq.pdoc_quincena}</p>
        </div>
        <button onClick={() => router.push('/per/liquidaciones')}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Volver</button>
      </div>

      {liq.detalle && liq.detalle.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Detalle de conceptos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2 px-2">Concepto</th>
                  <th className="py-2 px-2 w-20 text-right hidden sm:table-cell">Cant.</th>
                  <th className="py-2 px-2 w-20 text-right hidden sm:table-cell">%</th>
                  <th className="py-2 px-2 w-28 text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {liq.detalle.map((d) => (
                  <tr key={d.pddet_item} className="border-b border-gray-100">
                    <td className="py-2 px-2 text-xs text-gray-400">{d.pddet_item}</td>
                    <td className="py-2 px-2 text-gray-800">{d.concepto_desc ?? `Conc. ${d.pddet_clave_concepto}`}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-600 hidden sm:table-cell">{d.pddet_cantidad != null ? Number(d.pddet_cantidad).toFixed(2) : '—'}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-600 hidden sm:table-cell">{d.pddet_porcentaje != null ? `${d.pddet_porcentaje}%` : '—'}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-700 font-medium">{fmt(d.pddet_imp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
