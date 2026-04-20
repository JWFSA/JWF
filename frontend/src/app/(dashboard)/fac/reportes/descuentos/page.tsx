'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReporteDescuentos } from '@/services/fac';
import { formatDate, formatMoney, toInputDate } from '@/lib/utils';
import ExportButton from '@/components/ui/ExportButton';
import type { ReporteDescuentoVendedor, ReporteDescuentoDetalle } from '@/types/fac';

const monedaLabel = (desc: string | null, codigo: number | null) =>
  desc || (codigo != null ? `Moneda ${codigo}` : 'Sin moneda');

function getDefaultRange() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1);
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { desde: toInputDate(desde.toISOString()), hasta: toInputDate(hasta.toISOString()) };
}

export default function ReporteDescuentosPage() {
  const def = getDefaultRange();
  const [fechaDesde, setFechaDesde] = useState(def.desde);
  const [fechaHasta, setFechaHasta] = useState(def.hasta);
  const [vendedor, setVendedor] = useState('');
  const [tab, setTab] = useState<'resumen' | 'detalle'>('resumen');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['reporte-descuentos', { fechaDesde, fechaHasta, vendedor }],
    queryFn: () => getReporteDescuentos({ fechaDesde, fechaHasta, vendedor }),
    enabled: !!fechaDesde && !!fechaHasta,
  });

  const totalesPorMoneda = data?.totalesPorMoneda ?? [];
  const porVendedor = data?.porVendedor ?? [];
  const detalle = data?.detalle ?? [];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Total Descuentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Informe mensual de descuentos en facturacion y ventas</p>
        </div>
        <ExportButton
          filename={`descuentos_${tab}_${fechaDesde}_${fechaHasta}`}
          fetchData={async () => ({
            data: tab === 'resumen'
              ? porVendedor.map((r) => ({
                  vendedor: r.vendedor,
                  moneda: monedaLabel(r.mon_desc, r.mon_codigo),
                  solicitudes: r.solicitudes,
                  items: r.items,
                  total_neto_anterior: r.total_neto_anterior,
                  total_descuento_solicitado: r.total_descuento_solicitado,
                  total_descuento_aprobado: r.total_descuento_aprobado,
                  total_descuento_rechazado: r.total_descuento_rechazado,
                  total_descuento_pendiente: r.total_descuento_pendiente,
                  total_neto_final: r.total_neto_final,
                }))
              : detalle.map((r) => ({
                  sod_nro: r.sod_nro,
                  sod_fecha_sol: r.sod_fecha_sol,
                  vendedor: r.vendedor,
                  cliente: r.cliente,
                  moneda: monedaLabel(r.mon_desc, r.mon_codigo),
                  items: r.items,
                  total_neto_anterior: r.total_neto_anterior,
                  total_descuento_solicitado: r.total_descuento_solicitado,
                  total_descuento_aprobado: r.total_descuento_aprobado,
                  total_neto_final: r.total_neto_final,
                })),
          })}
          columns={tab === 'resumen' ? [
            { header: 'Vendedor', value: (r) => r.vendedor },
            { header: 'Moneda', value: (r) => r.moneda },
            { header: 'Solicitudes', value: (r) => r.solicitudes },
            { header: 'Items', value: (r) => r.items },
            { header: 'Neto anterior', value: (r) => r.total_neto_anterior },
            { header: 'Dcto. solicitado', value: (r) => r.total_descuento_solicitado },
            { header: 'Dcto. aprobado', value: (r) => r.total_descuento_aprobado },
            { header: 'Dcto. rechazado', value: (r) => r.total_descuento_rechazado },
            { header: 'Dcto. pendiente', value: (r) => r.total_descuento_pendiente },
            { header: 'Neto final', value: (r) => r.total_neto_final },
          ] : [
            { header: 'Nro.', value: (r) => r.sod_nro },
            { header: 'Fecha', value: (r) => r.sod_fecha_sol ? formatDate(r.sod_fecha_sol) : '' },
            { header: 'Vendedor', value: (r) => r.vendedor },
            { header: 'Cliente', value: (r) => r.cliente ?? '' },
            { header: 'Moneda', value: (r) => r.moneda },
            { header: 'Items', value: (r) => r.items },
            { header: 'Neto anterior', value: (r) => r.total_neto_anterior },
            { header: 'Dcto. solicitado', value: (r) => r.total_descuento_solicitado },
            { header: 'Dcto. aprobado', value: (r) => r.total_descuento_aprobado },
            { header: 'Neto final', value: (r) => r.total_neto_final },
          ]}
        />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha desde</label>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha hasta</label>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vendedor</label>
            <input type="text" value={vendedor} onChange={(e) => setVendedor(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Todos" />
          </div>
          <div className="flex items-end">
            {isFetching && <span className="text-xs text-gray-400 py-2">Cargando...</span>}
          </div>
        </div>
      </div>

      {/* Tarjetas resumen por moneda */}
      {totalesPorMoneda.length > 0 && (
        <div className="space-y-3 mb-4">
          {totalesPorMoneda.map((t) => (
            <div key={t.mon_codigo ?? 'null'} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-700">{monedaLabel(t.mon_desc, t.mon_codigo)}</span>
                {t.mon_simbolo && <span className="text-xs text-gray-400">({t.mon_simbolo})</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card label="Solicitudes" value={t.solicitudes.toString()} />
                <Card label="Descuento solicitado" value={formatMoney(t.total_descuento_solicitado)} color="text-blue-700" />
                <Card label="Descuento aprobado" value={formatMoney(t.total_descuento_aprobado)} color="text-green-700" />
                <Card label="Descuento rechazado" value={formatMoney(t.total_descuento_rechazado)} color="text-red-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setTab('resumen')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === 'resumen' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Resumen por vendedor
          </button>
          <button onClick={() => setTab('detalle')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === 'detalle' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Detalle por solicitud
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Cargando reporte...</div>
        ) : !data ? (
          <div className="p-8 text-center text-sm text-gray-400">Seleccione un rango de fechas</div>
        ) : tab === 'resumen' ? (
          <ResumenTable rows={porVendedor} />
        ) : (
          <DetalleTable rows={detalle} />
        )}
      </div>
    </div>
  );
}

function Card({ label, value, color = 'text-gray-800' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-semibold ${color} mt-0.5`}>{value}</p>
    </div>
  );
}

function ResumenTable({ rows }: { rows: ReporteDescuentoVendedor[] }) {
  if (!rows.length) return <div className="p-8 text-center text-sm text-gray-400">Sin datos para el rango seleccionado</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
            <th className="px-4 py-3 font-medium">Vendedor</th>
            <th className="px-4 py-3 font-medium">Moneda</th>
            <th className="px-4 py-3 font-medium text-center">Sol.</th>
            <th className="px-4 py-3 font-medium text-right">Neto anterior</th>
            <th className="px-4 py-3 font-medium text-right">Dcto. solicitado</th>
            <th className="px-4 py-3 font-medium text-right">Dcto. aprobado</th>
            <th className="px-4 py-3 font-medium text-right">Dcto. rechazado</th>
            <th className="px-4 py-3 font-medium text-right">Dcto. pendiente</th>
            <th className="px-4 py-3 font-medium text-right">Neto final</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.vendedor}-${r.mon_codigo ?? 'x'}`} className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="px-4 py-2.5 font-medium text-gray-800">{r.vendedor}</td>
              <td className="px-4 py-2.5 text-gray-600 text-xs">{monedaLabel(r.mon_desc, r.mon_codigo)}</td>
              <td className="px-4 py-2.5 text-center text-gray-600">{r.solicitudes}</td>
              <td className="px-4 py-2.5 text-right text-gray-600 font-mono text-xs">{formatMoney(r.total_neto_anterior)}</td>
              <td className="px-4 py-2.5 text-right text-blue-700 font-mono text-xs">{formatMoney(r.total_descuento_solicitado)}</td>
              <td className="px-4 py-2.5 text-right text-green-700 font-mono text-xs">{formatMoney(r.total_descuento_aprobado)}</td>
              <td className="px-4 py-2.5 text-right text-red-600 font-mono text-xs">{formatMoney(r.total_descuento_rechazado)}</td>
              <td className="px-4 py-2.5 text-right text-amber-600 font-mono text-xs">{formatMoney(r.total_descuento_pendiente)}</td>
              <td className="px-4 py-2.5 text-right text-gray-800 font-semibold font-mono text-xs">{formatMoney(r.total_neto_final)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetalleTable({ rows }: { rows: ReporteDescuentoDetalle[] }) {
  if (!rows.length) return <div className="p-8 text-center text-sm text-gray-400">Sin datos para el rango seleccionado</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
            <th className="px-4 py-3 font-medium w-16">Nro.</th>
            <th className="px-4 py-3 font-medium w-24">Fecha</th>
            <th className="px-4 py-3 font-medium">Vendedor</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Moneda</th>
            <th className="px-4 py-3 font-medium text-center w-14">Items</th>
            <th className="px-4 py-3 font-medium text-right">Neto anterior</th>
            <th className="px-4 py-3 font-medium text-right">Dcto. solicitado</th>
            <th className="px-4 py-3 font-medium text-right">Dcto. aprobado</th>
            <th className="px-4 py-3 font-medium text-right">Neto final</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sod_clave} className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{r.sod_nro}</td>
              <td className="px-4 py-2.5 text-xs text-gray-600">{formatDate(r.sod_fecha_sol)}</td>
              <td className="px-4 py-2.5 font-medium text-gray-800">{r.vendedor}</td>
              <td className="px-4 py-2.5 text-gray-600 truncate max-w-[200px]">{r.cliente ?? '-'}</td>
              <td className="px-4 py-2.5 text-gray-600 text-xs">{monedaLabel(r.mon_desc, r.mon_codigo)}</td>
              <td className="px-4 py-2.5 text-center text-gray-500">{r.items}</td>
              <td className="px-4 py-2.5 text-right text-gray-600 font-mono text-xs">{formatMoney(r.total_neto_anterior)}</td>
              <td className="px-4 py-2.5 text-right text-blue-700 font-mono text-xs">{formatMoney(r.total_descuento_solicitado)}</td>
              <td className="px-4 py-2.5 text-right text-green-700 font-mono text-xs">{formatMoney(r.total_descuento_aprobado)}</td>
              <td className="px-4 py-2.5 text-right text-gray-800 font-semibold font-mono text-xs">{formatMoney(r.total_neto_final)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
