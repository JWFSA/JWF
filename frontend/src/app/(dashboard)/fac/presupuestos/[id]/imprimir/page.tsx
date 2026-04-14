'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getPresupuesto } from '@/services/fac';
import { formatDate } from '@/lib/utils';
import { Printer, ArrowLeft } from 'lucide-react';

const fmt = (n?: number | null) =>
  n != null ? new Intl.NumberFormat('es-PY').format(Number(n)) : '0';

export default function ImprimirPresupuestoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: pedido, isLoading } = useQuery({
    queryKey: ['presupuesto', id],
    queryFn: () => getPresupuesto(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  if (!pedido) return <div className="p-8 text-center text-gray-500">Presupuesto no encontrado</div>;

  const items = pedido.items ?? [];
  const subtotal = items.reduce((s, it) => s + Number(it.pdet_cant_ped || 0) * Number(it.pdet_precio || 0), 0);
  const totalDcto = items.reduce((s, it) => {
    const bruto = Number(it.pdet_cant_ped || 0) * Number(it.pdet_precio || 0);
    return s + bruto * (Number(it.pdet_porc_dcto || 0) / 100);
  }, 0);
  const total = subtotal - totalDcto;

  return (
    <>
      <div className="print:hidden p-4 flex items-center gap-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800">
          <ArrowLeft size={16} /> Volver
        </button>
        <button onClick={() => window.print()}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition">
          <Printer size={16} /> Imprimir
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto p-8 print:p-0 print:max-w-none bg-white print:shadow-none">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PRESUPUESTO N.&ordm; {pedido.ped_nro}</h1>
            <p className="text-sm text-gray-500 mt-1">Fecha: {formatDate(pedido.ped_fecha)}</p>
            {pedido.ped_dias_validez && (
              <p className="text-sm text-gray-500">Validez: {pedido.ped_dias_validez} d&iacute;as</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              Estado: {pedido.ped_estado === 'P' ? 'Pendiente' : pedido.ped_estado === 'A' ? 'Aprobado' : 'Cerrado'}
            </p>
            {pedido.mon_desc && <p className="text-sm text-gray-500">Moneda: {pedido.mon_desc}</p>}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cliente</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div><span className="text-gray-500">Nombre:</span> <span className="font-medium">{pedido.cli_nom ?? pedido.ped_cli_nom ?? '\u2014'}</span></div>
            <div><span className="text-gray-500">RUC:</span> <span className="font-medium">{pedido.ped_ruc ?? pedido.cli_ruc ?? '\u2014'}</span></div>
            <div><span className="text-gray-500">Contacto:</span> <span className="font-medium">{pedido.ped_contacto ?? '\u2014'}</span></div>
            <div><span className="text-gray-500">Tel&eacute;fono:</span> <span className="font-medium">{pedido.ped_tel ?? '\u2014'}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          {pedido.vend_nombre && (
            <div><span className="text-gray-500">Vendedor:</span> <span className="font-medium">{pedido.vend_nombre} {pedido.vend_apellido}</span></div>
          )}
          {pedido.ped_cond_venta && (
            <div><span className="text-gray-500">Cond. Venta:</span> <span className="font-medium">{pedido.ped_cond_venta}</span></div>
          )}
          {pedido.ped_producto && (
            <div><span className="text-gray-500">Producto:</span> <span className="font-medium">{pedido.ped_producto}</span></div>
          )}
          {pedido.ped_tiempo_realiz && (
            <div><span className="text-gray-500">Tiempo Realiz.:</span> <span className="font-medium">{pedido.ped_tiempo_realiz}</span></div>
          )}
        </div>

        <table className="w-full text-sm mb-6 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 pr-2 w-8">#</th>
              <th className="text-left py-2 pr-2">Art&iacute;culo</th>
              <th className="text-left py-2 pr-2 w-14">UM</th>
              <th className="text-right py-2 pr-2 w-20">Cant.</th>
              <th className="text-right py-2 pr-2 w-28">Precio</th>
              <th className="text-right py-2 pr-2 w-16">% Dto.</th>
              <th className="text-right py-2 w-28">Neto</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const neto = Number(it.pdet_cant_ped || 0) * Number(it.pdet_precio || 0) * (1 - Number(it.pdet_porc_dcto || 0) / 100);
              return (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-1.5 pr-2 text-gray-400">{idx + 1}</td>
                  <td className="py-1.5 pr-2">
                    <div className="font-medium">{it.art_desc}</div>
                    {it.pdet_desc_larga && it.pdet_desc_larga !== it.art_desc && (
                      <div className="text-xs text-gray-500">{it.pdet_desc_larga}</div>
                    )}
                  </td>
                  <td className="py-1.5 pr-2 text-center">{it.pdet_um_ped}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">{fmt(Number(it.pdet_cant_ped))}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">{fmt(Number(it.pdet_precio))}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">{Number(it.pdet_porc_dcto) || 0}%</td>
                  <td className="py-1.5 text-right tabular-nums font-medium">{fmt(neto)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Sub.Total</span><span className="tabular-nums">{fmt(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Dcto.Gral.</span><span className="tabular-nums">{fmt(totalDcto)}</span></div>
            <div className="flex justify-between font-bold text-base border-t-2 border-gray-300 pt-1 mt-1">
              <span>TOTAL</span><span className="tabular-nums">{fmt(total)}</span>
            </div>
          </div>
        </div>

        {pedido.ped_obs && (
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Observaciones</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{pedido.ped_obs}</p>
          </div>
        )}
      </div>
    </>
  );
}
