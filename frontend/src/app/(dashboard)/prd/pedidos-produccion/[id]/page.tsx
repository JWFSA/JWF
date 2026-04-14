'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPedidoProduccion } from '@/services/prd';
import { formatDate } from '@/lib/utils';

const fmt = (n?: number | null) => n != null ? new Intl.NumberFormat('es-PY').format(Number(n)) : '\u2014';

export default function DetallePedidoProduccionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: pp, isLoading } = useQuery({ queryKey: ['pedido-produccion', id], queryFn: () => getPedidoProduccion(Number(id)) });

  if (isLoading) return <div className="p-6"><div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" /><div className="h-64 bg-gray-100 rounded-xl animate-pulse" /></div>;
  if (!pp) return <div className="p-6 text-gray-500">Pedido de producci&oacute;n no encontrado</div>;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Pedido Producci&oacute;n #{pp.pp_nro}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pp.pp_cli_nom} {pp.pp_clave_ped ? `\u00b7 Pedido venta #${pp.pp_nro_pedido}` : ''}</p>
        </div>
        <button onClick={() => router.push('/prd/pedidos-produccion')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Volver</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Datos generales</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Fecha:</span> <span className="font-medium">{formatDate(pp.pp_fec_emis)}</span></div>
          <div><span className="text-gray-500">Cliente:</span> <span className="font-medium">{pp.pp_cli_nom}</span></div>
          <div><span className="text-gray-500">RUC:</span> <span className="font-medium">{pp.pp_cli_ruc ?? '\u2014'}</span></div>
          <div><span className="text-gray-500">Contacto:</span> <span className="font-medium">{pp.pp_cli_contacto ?? '\u2014'}</span></div>
          <div><span className="text-gray-500">Entrega:</span> <span className="font-medium">{pp.pp_fec_ent ? formatDate(pp.pp_fec_ent) : '\u2014'}</span></div>
          <div><span className="text-gray-500">Estado:</span> <span className="font-medium">{pp.pp_estado}</span></div>
          <div><span className="text-gray-500">Dise&ntilde;o:</span> <span className="font-medium">{pp.pp_disenho === 'S' ? 'S\u00ed' : 'No'}</span></div>
        </div>
        {pp.pp_obs && <div className="mt-3 text-sm"><span className="text-gray-500">Obs:</span> <span className="text-gray-700">{pp.pp_obs}</span></div>}
      </div>

      {(pp.items ?? []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">&Iacute;tems</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead><tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                <th className="py-2 px-2 w-8">#</th><th className="py-2 px-2">Art&iacute;culo</th>
                <th className="py-2 px-2 w-20 text-right">Cant.</th><th className="py-2 px-2 w-14">UM</th>
                <th className="py-2 px-2">Medidas</th><th className="py-2 px-2 w-24">OT</th>
                <th className="py-2 px-2 w-24">Fec.Prev</th>
              </tr></thead>
              <tbody>
                {(pp.items ?? []).map((it) => (
                  <tr key={it.ppdet_item} className="border-b border-gray-100">
                    <td className="py-1.5 px-2 text-xs text-gray-400">{it.ppdet_item}</td>
                    <td className="py-1.5 px-2 text-gray-800">{it.art_desc ?? it.ppdet_descripcion ?? '\u2014'}</td>
                    <td className="py-1.5 px-2 text-right tabular-nums">{fmt(Number(it.ppdet_cant))}</td>
                    <td className="py-1.5 px-2 text-xs">{it.ppdet_um}</td>
                    <td className="py-1.5 px-2 text-xs text-gray-500">
                      {it.ppdet_med_largo || it.ppdet_med_ancho || it.ppdet_med_alto
                        ? `${it.ppdet_med_largo ?? ''} x ${it.ppdet_med_ancho ?? ''} x ${it.ppdet_med_alto ?? ''}`
                        : it.ppdet_medida ?? '\u2014'}
                    </td>
                    <td className="py-1.5 px-2 text-xs text-gray-500">{it.ppdet_ot ?? '\u2014'}</td>
                    <td className="py-1.5 px-2 text-xs text-gray-500">{it.ppdet_fec_prev ? formatDate(it.ppdet_fec_prev) : '\u2014'}</td>
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
