'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSolicitudDescuento } from '@/services/fac';
import { formatDate } from '@/lib/utils';

const ESTADO: Record<string, string> = { P: 'Pendiente', A: 'Aprobado', R: 'Rechazado' };
const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

export default function SolicitudDescuentoDetallePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: sol, isLoading } = useQuery({
    queryKey: ['fac-sol-descuento', id],
    queryFn: () => getSolicitudDescuento(Number(id)),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!sol)      return <div className="p-6 text-sm text-red-500">Solicitud no encontrada</div>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Solicitud de descuento</h1>
          <p className="text-sm text-gray-500 mt-0.5">Nro. {sol.sod_nro} · {formatDate(sol.sod_fecha_sol)} · {sol.sod_login_sol}</p>
        </div>
        <button onClick={() => router.push('/fac/solicitudes-descuento')}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
          Volver
        </button>
      </div>

      {sol.detalle && sol.detalle.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Detalle de ítems</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2 px-2">Artículo</th>
                  <th className="py-2 px-2 w-20 text-right">% Sol.</th>
                  <th className="py-2 px-2 w-20 text-right">% Aprob.</th>
                  <th className="py-2 px-2 w-24 text-right">Imp. sol.</th>
                  <th className="py-2 px-2 w-24 text-right">Imp. aprob.</th>
                  <th className="py-2 px-2 w-20">Estado</th>
                  <th className="py-2 px-2 w-24 hidden md:table-cell">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {sol.detalle.map((d) => (
                  <tr key={d.sode_item} className="border-b border-gray-100">
                    <td className="py-2 px-2 text-xs text-gray-400">{d.sode_item}</td>
                    <td className="py-2 px-2 text-gray-800">{d.art_desc ?? `Art. ${d.sode_art}`}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-600">{d.sode_dcto_sol != null ? `${d.sode_dcto_sol}%` : '—'}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-700 font-medium">{d.sode_dcto_aprob != null ? `${d.sode_dcto_aprob}%` : '—'}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-600">{fmt(d.sode_imp_sol)}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-700 font-medium">{fmt(d.sode_imp_aprob)}</td>
                    <td className="py-2 px-2 text-xs text-gray-500">{ESTADO[d.sode_estado ?? ''] ?? d.sode_estado ?? '—'}</td>
                    <td className="py-2 px-2 text-xs text-gray-500 hidden md:table-cell">{d.sode_user_est ?? '—'}</td>
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
