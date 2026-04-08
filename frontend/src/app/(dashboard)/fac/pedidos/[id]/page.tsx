'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPedido, updatePedido, aprobarPedido, rechazarPedido } from '@/services/fac';
import { crearOTDesdePedido, crearPPDesdePedido } from '@/services/prd';
import { formatDate } from '@/lib/utils';
import type { Pedido } from '@/types/fac';
import PedidoForm from '@/components/fac/PedidoForm';
import { Receipt, Printer, CheckCircle, XCircle, TicketPercent, Wrench, Factory } from 'lucide-react';

export default function EditarPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const [showRechazo, setShowRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const { data: pedido, isLoading } = useQuery({
    queryKey: ['pedido', id],
    queryFn: () => getPedido(Number(id)),
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['pedidos'] });
    qc.invalidateQueries({ queryKey: ['pedido', id] });
  };

  const mut = useMutation({
    mutationFn: (data: Partial<Pedido>) => updatePedido(Number(id), data),
    onSuccess: () => { refresh(); router.push('/fac/pedidos'); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const aprobarMut = useMutation({
    mutationFn: () => aprobarPedido(Number(id)),
    onSuccess: refresh,
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al aprobar'),
  });

  const rechazarMut = useMutation({
    mutationFn: (motivo: string) => rechazarPedido(Number(id), motivo),
    onSuccess: () => { setShowRechazo(false); refresh(); },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al rechazar'),
  });

  const crearOTMut = useMutation({
    mutationFn: () => crearOTDesdePedido(Number(id)),
    onSuccess: (data) => router.push(`/prd/ordenes-trabajo/${data.ot_clave}`),
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al crear OT'),
  });

  const crearPPMut = useMutation({
    mutationFn: () => crearPPDesdePedido(Number(id)),
    onSuccess: (data) => router.push(`/prd/pedidos-produccion/${data.pp_clave}`),
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al crear ped. producci\u00f3n'),
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-gray-500">Pedido no encontrado.</p>
      </div>
    );
  }

  const isPendiente = pedido.ped_estado === 'P';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Pedido #{pedido.ped_nro}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pedido.cli_nom}</p>
          {pedido.ped_obs_rechazo && (
            <p className="text-sm text-red-600 mt-1 bg-red-50 px-3 py-1 rounded-lg">
              Rechazado: {pedido.ped_obs_rechazo}
              {pedido.ped_user_rechazo && <span className="text-red-400 ml-2">({pedido.ped_user_rechazo})</span>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isPendiente && (
            <>
              <button
                type="button"
                onClick={() => { if (confirm('\u00BFAprobar este pedido?')) aprobarMut.mutate(); }}
                disabled={aprobarMut.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
              >
                <CheckCircle size={16} /> Aprobar
              </button>
              <button
                type="button"
                onClick={() => setShowRechazo(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                <XCircle size={16} /> Rechazar
              </button>
            </>
          )}
          <button type="button"
            onClick={() => router.push(`/fac/solicitudes-descuento/nuevo?pedido=${pedido.ped_clave}`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            <TicketPercent size={16} /> Sol. Dto.
          </button>
          <button type="button"
            onClick={() => { if (confirm('\u00BFGenerar OT desde este pedido?')) crearOTMut.mutate(); }}
            disabled={crearOTMut.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition">
            <Wrench size={16} /> Generar OT
          </button>
          <button type="button"
            onClick={() => { if (confirm('\u00BFGenerar pedido de producci\u00f3n?')) crearPPMut.mutate(); }}
            disabled={crearPPMut.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition">
            <Factory size={16} /> Ped. Prod.
          </button>
          <button
            type="button"
            onClick={() => router.push(`/fac/pedidos/${pedido.ped_clave}/imprimir`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            <Printer size={16} /> Imprimir
          </button>
          <button
            type="button"
            onClick={() => router.push(`/fac/facturas/nuevo?pedido=${pedido.ped_clave}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            <Receipt size={16} /> Facturar
          </button>
        </div>
      </div>

      {/* Modal de rechazo */}
      {showRechazo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Rechazar pedido</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del rechazo</label>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              rows={3}
              placeholder="Ingrese el motivo del rechazo..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowRechazo(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                onClick={() => rechazarMut.mutate(motivoRechazo)}
                disabled={rechazarMut.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
              >
                {rechazarMut.isPending ? 'Rechazando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTs vinculadas */}
      {(pedido.ordenes_trabajo ?? []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{'\u00d3'}rdenes de trabajo vinculadas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-2 px-2 w-20">OT Nro.</th>
                  <th className="py-2 px-2 w-16">Item</th>
                  <th className="py-2 px-2 w-24">Tipo</th>
                  <th className="py-2 px-2">Descripci{'\u00f3'}n</th>
                  <th className="py-2 px-2 w-24">Fecha</th>
                  <th className="py-2 px-2 w-24">Situaci{'\u00f3'}n</th>
                </tr>
              </thead>
              <tbody>
                {pedido.ordenes_trabajo!.map((ot) => {
                  const sitMap: Record<number, { label: string; cls: string }> = {
                    0: { label: 'Ingresada', cls: 'bg-gray-100 text-gray-600' },
                    1: { label: 'Abierta', cls: 'bg-blue-100 text-blue-700' },
                    2: { label: 'En proceso', cls: 'bg-yellow-100 text-yellow-700' },
                    3: { label: 'Terminada', cls: 'bg-green-100 text-green-700' },
                    4: { label: 'Facturada', cls: 'bg-purple-100 text-purple-700' },
                  };
                  const sit = sitMap[Number(ot.ot_situacion)] ?? { label: String(ot.ot_situacion), cls: 'bg-gray-100 text-gray-500' };
                  return (
                    <tr key={ot.ot_clave} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/prd/ordenes-trabajo/${ot.ot_clave}`)}>
                      <td className="py-2 px-2 font-mono text-xs text-primary-600 font-medium">{ot.ot_nro}{ot.ot_serie ? `-${ot.ot_serie}` : ''}</td>
                      <td className="py-2 px-2 text-xs text-gray-500">{ot.ot_nro_item_ped ?? '\u2014'}</td>
                      <td className="py-2 px-2 text-xs text-gray-500">{ot.tipo_desc ?? '\u2014'}</td>
                      <td className="py-2 px-2 text-gray-700 truncate max-w-[250px]">{ot.ot_desc ?? '\u2014'}</td>
                      <td className="py-2 px-2 text-xs text-gray-500">{ot.ot_fec_emis ? formatDate(ot.ot_fec_emis) : '\u2014'}</td>
                      <td className="py-2 px-2"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sit.cls}`}>{sit.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PedidoForm
        tipo={pedido.ped_tipo ?? 'V'}
        initial={pedido}
        onSave={async (data: Partial<Pedido>) => mut.mutate(data)}
        isPending={mut.isPending}
        error={error}
      />
    </div>
  );
}
