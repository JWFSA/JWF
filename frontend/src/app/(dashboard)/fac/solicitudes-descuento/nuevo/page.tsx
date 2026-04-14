'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPedido, createSolicitudDescuento } from '@/services/fac';
import type { PedidoDet } from '@/types/fac';

const fmt = (n?: number | null) =>
  n != null ? new Intl.NumberFormat('es-PY').format(Number(n)) : '0';

export default function NuevaSolicitudDescuentoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get('pedido');

  const [pedidoInput, setPedidoInput] = useState(pedidoId ?? '');
  const [loadId, setLoadId] = useState<number | null>(pedidoId ? Number(pedidoId) : null);
  const [selected, setSelected] = useState<Map<number, number>>(new Map()); // item -> dcto solicitado
  const [error, setError] = useState('');

  const { data: pedido, isLoading } = useQuery({
    queryKey: ['pedido-para-sol', loadId],
    queryFn: () => getPedido(loadId!),
    enabled: !!loadId,
  });

  const mut = useMutation({
    mutationFn: createSolicitudDescuento,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['fac-sol-descuento'] });
      router.push(`/fac/solicitudes-descuento/${data.sod_clave}`);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al crear'),
  });

  const buscarPedido = () => {
    const n = Number(pedidoInput);
    if (n > 0) { setLoadId(n); setSelected(new Map()); }
  };

  const toggleItem = (item: PedidoDet) => {
    const key = item.pdet_nro_item!;
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(key)) next.delete(key);
      else next.set(key, Number(item.pdet_porc_dcto) || 0);
      return next;
    });
  };

  const setDcto = (itemNro: number, dcto: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(itemNro, dcto);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!pedido || selected.size === 0) return;
    const detalle = Array.from(selected.entries()).map(([itemNro, dcto]) => {
      const it = pedido.items?.find((i) => i.pdet_nro_item === itemNro);
      const neto = Number(it?.pdet_cant_ped || 0) * Number(it?.pdet_precio || 0) * (1 - Number(it?.pdet_porc_dcto || 0) / 100);
      return {
        sode_art: it?.pdet_art,
        sode_item_ped: itemNro,
        sode_dcto_sol: dcto,
        sode_imp_neto_ant: neto,
      };
    });
    mut.mutate({ sod_clave_ped: pedido.ped_clave, detalle });
  };

  const items = pedido?.items ?? [];
  const inp = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Nueva solicitud de descuento</h1>
        <p className="text-sm text-gray-500 mt-0.5">Seleccione un pedido y los \u00edtems a solicitar descuento</p>
      </div>

      {/* Buscar pedido */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nro. Pedido (clave)</label>
            <input type="number" value={pedidoInput} onChange={(e) => setPedidoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarPedido()}
              placeholder="Ej: 12345" className={`w-48 ${inp}`} />
          </div>
          <button onClick={buscarPedido}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition">
            Buscar
          </button>
        </div>

        {isLoading && <p className="mt-4 text-sm text-gray-500">Cargando pedido...</p>}

        {pedido && (
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">Pedido #{pedido.ped_nro}</span> &middot; {pedido.cli_nom} &middot; {items.length} \u00edtems
          </div>
        )}
      </div>

      {/* Items del pedido */}
      {pedido && items.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Seleccione \u00edtems para la solicitud</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-2 px-2 w-8"></th>
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2 px-2">Art\u00edculo</th>
                  <th className="py-2 px-2 w-20 text-right">Cant.</th>
                  <th className="py-2 px-2 w-24 text-right">Precio</th>
                  <th className="py-2 px-2 w-20 text-right">% Dto.Act.</th>
                  <th className="py-2 px-2 w-24 text-right">Neto</th>
                  <th className="py-2 px-2 w-24 text-right">% Dto.Sol.</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const nro = it.pdet_nro_item!;
                  const isSelected = selected.has(nro);
                  const neto = Number(it.pdet_cant_ped || 0) * Number(it.pdet_precio || 0) * (1 - Number(it.pdet_porc_dcto || 0) / 100);
                  return (
                    <tr key={nro} className={`border-b border-gray-100 ${isSelected ? 'bg-primary-50' : ''}`}>
                      <td className="py-2 px-2">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleItem(it)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-400">{nro}</td>
                      <td className="py-2 px-2 text-gray-800">{it.art_desc}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{fmt(Number(it.pdet_cant_ped))}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{fmt(Number(it.pdet_precio))}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-gray-500">{Number(it.pdet_porc_dcto) || 0}%</td>
                      <td className="py-2 px-2 text-right tabular-nums font-medium">{fmt(neto)}</td>
                      <td className="py-2 px-2">
                        {isSelected && (
                          <input type="number" min="0" max="100" step="0.01"
                            value={selected.get(nro) ?? 0}
                            onChange={(e) => setDcto(nro, parseFloat(e.target.value) || 0)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {error && <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={selected.size === 0 || mut.isPending}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
              {mut.isPending ? 'Creando...' : `Crear solicitud (${selected.size} \u00edtems)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
