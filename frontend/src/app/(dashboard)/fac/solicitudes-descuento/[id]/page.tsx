'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSolicitudDescuento, aprobarSolicitudItem, rechazarSolicitudItem, aprobarSolicitudTodos, rechazarSolicitudTodos } from '@/services/fac';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, CheckCheck, XOctagon } from 'lucide-react';

const ESTADO: Record<string, { label: string; cls: string }> = {
  P: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-700' },
  A: { label: 'Aprobado',  cls: 'bg-green-100 text-green-700' },
  R: { label: 'Rechazado', cls: 'bg-red-100 text-red-700' },
};

const fmt = (n: number | null | undefined) =>
  n == null ? '\u2014' : new Intl.NumberFormat('es-PY').format(Number(n));

export default function SolicitudDescuentoDetallePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const { data: sol, isLoading } = useQuery({
    queryKey: ['fac-sol-descuento', id],
    queryFn: () => getSolicitudDescuento(Number(id)),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['fac-sol-descuento', id] });

  const aprobarItemMut = useMutation({
    mutationFn: ({ item, dcto }: { item: number; dcto?: number }) => aprobarSolicitudItem(Number(id), item, dcto != null ? { sode_dcto_aprob: dcto } : {}),
    onSuccess: refresh,
  });

  const rechazarItemMut = useMutation({
    mutationFn: (item: number) => rechazarSolicitudItem(Number(id), item),
    onSuccess: refresh,
  });

  const aprobarTodosMut = useMutation({
    mutationFn: () => aprobarSolicitudTodos(Number(id)),
    onSuccess: refresh,
  });

  const rechazarTodosMut = useMutation({
    mutationFn: () => rechazarSolicitudTodos(Number(id)),
    onSuccess: refresh,
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!sol) return <div className="p-6 text-sm text-red-500">Solicitud no encontrada</div>;

  const hayPendientes = (sol.detalle || []).some((d) => d.sode_estado === 'P');

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Solicitud de descuento</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Nro. {sol.sod_nro} &middot; {formatDate(sol.sod_fecha_sol)} &middot; {sol.sod_login_sol}
            {sol.sod_clave_ped && <span> &middot; Pedido #{sol.sod_clave_ped}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hayPendientes && (
            <>
              <button
                onClick={() => { if (confirm('\u00BFAprobar TODOS los \u00edtems pendientes?')) aprobarTodosMut.mutate(); }}
                disabled={aprobarTodosMut.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
              >
                <CheckCheck size={16} /> Aprobar todos
              </button>
              <button
                onClick={() => { if (confirm('\u00BFRechazar TODOS los \u00edtems pendientes?')) rechazarTodosMut.mutate(); }}
                disabled={rechazarTodosMut.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
              >
                <XOctagon size={16} /> Rechazar todos
              </button>
            </>
          )}
          <button onClick={() => router.push('/fac/solicitudes-descuento')}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Volver
          </button>
        </div>
      </div>

      {sol.detalle && sol.detalle.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Detalle de \u00edtems</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2 px-2">Art\u00edculo</th>
                  <th className="py-2 px-2 w-24 text-right">Neto ant.</th>
                  <th className="py-2 px-2 w-20 text-right">% Sol.</th>
                  <th className="py-2 px-2 w-24 text-right">Imp. sol.</th>
                  <th className="py-2 px-2 w-20 text-right">% Aprob.</th>
                  <th className="py-2 px-2 w-24 text-right">Imp. aprob.</th>
                  <th className="py-2 px-2 w-24 text-right">Neto final</th>
                  <th className="py-2 px-2 w-24">Estado</th>
                  <th className="py-2 px-2 w-20 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sol.detalle.map((d) => {
                  const est = ESTADO[d.sode_estado ?? ''] ?? { label: d.sode_estado ?? '\u2014', cls: 'bg-gray-100 text-gray-500' };
                  const isPending = d.sode_estado === 'P';
                  return (
                    <tr key={d.sode_item} className="border-b border-gray-100">
                      <td className="py-2 px-2 text-xs text-gray-400">{d.sode_item}</td>
                      <td className="py-2 px-2 text-gray-800">{d.art_desc ?? `Art. ${d.sode_art}`}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-gray-600">{fmt(d.sode_imp_neto_ant)}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-gray-600">{d.sode_dcto_sol != null ? `${d.sode_dcto_sol}%` : '\u2014'}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-gray-600">{fmt(d.sode_imp_sol)}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-gray-700 font-medium">{d.sode_dcto_aprob != null ? `${d.sode_dcto_aprob}%` : '\u2014'}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-gray-700 font-medium">{fmt(d.sode_imp_aprob)}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-gray-700 font-medium">{fmt(d.sode_imp_neto_final)}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${est.cls}`}>{est.label}</span>
                        {d.sode_user_est && <div className="text-[10px] text-gray-400 mt-0.5">{d.sode_user_est}</div>}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {isPending && (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              title="Aprobar"
                              onClick={() => aprobarItemMut.mutate({ item: d.sode_item })}
                              className="p-1 text-gray-400 hover:text-green-600 rounded transition"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              title="Rechazar"
                              onClick={() => rechazarItemMut.mutate(d.sode_item)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
