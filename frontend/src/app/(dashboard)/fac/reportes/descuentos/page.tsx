'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReporteDescuentos } from '@/services/fac';
import { formatDate, formatMoney, toInputDate } from '@/lib/utils';
import type { ReporteDescuentoVendedor, ReporteDescuentoDetalle } from '@/types/fac';

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

  const totales = data?.totales;
  const porVendedor = data?.porVendedor ?? [];
  const detalle = data?.detalle ?? [];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Total Descuentos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Informe mensual de descuentos en facturacion y ventas</p>
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

      {/* Tarjetas resumen */}
      {totales && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Card label="Solicitudes" value={totales.solicitudes.toString()} />
          <Card label="Descuento solicitado" value={formatMoney(totales.total_descuento_solicitado)} color="text-blue-700" />
          <Card label="Descuento aprobado" value={formatMoney(totales.total_descuento_aprobado)} color="text-green-700" />
          <Card label="Descuento rechazado" value={formatMoney(totales.total_descuento_rechazado)} color="text-red-600" />
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
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
            <th className="px-4 py-3 font-medium">Vendedor</th>
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
            <tr key={r.vendedor} className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="px-4 py-2.5 font-medium text-gray-800">{r.vendedor}</td>
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
      <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
            <th className="px-4 py-3 font-medium w-16">Nro.</th>
            <th className="px-4 py-3 font-medium w-24">Fecha</th>
            <th className="px-4 py-3 font-medium">Vendedor</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
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
