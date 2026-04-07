'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrdenTrabajo, updateOrdenTrabajo, addGastoOT, removeGastoOT, getTiposOT } from '@/services/prd';
import { getMonedas } from '@/services/gen';
import { formatDate } from '@/lib/utils';
import type { OrdenTrabajo } from '@/types/prd';
import { Trash2, Plus } from 'lucide-react';

const SIT: Record<number, string> = { 1: 'Abierta', 2: 'En proceso', 3: 'Terminada', 4: 'Facturada', 5: 'Anulada' };
const fmt = (n?: number | null) => n != null ? new Intl.NumberFormat('es-PY').format(Number(n)) : '0';

export default function DetalleOTPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [gastoForm, setGastoForm] = useState<Record<string, unknown>>({});

  const { data: ot, isLoading } = useQuery({ queryKey: ['ot', id], queryFn: () => getOrdenTrabajo(Number(id)) });
  const { data: tiposData } = useQuery({ queryKey: ['tipos-ot'], queryFn: getTiposOT });
  const { data: monedasData } = useQuery({ queryKey: ['monedas'], queryFn: getMonedas });

  const refresh = () => { qc.invalidateQueries({ queryKey: ['ot', id] }); qc.invalidateQueries({ queryKey: ['ordenes-trabajo'] }); };

  const updateMut = useMutation({
    mutationFn: (data: Partial<OrdenTrabajo>) => updateOrdenTrabajo(Number(id), data),
    onSuccess: refresh,
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al guardar'),
  });

  const addGastoMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => addGastoOT(Number(id), data),
    onSuccess: () => { refresh(); setShowGastoForm(false); setGastoForm({}); },
  });

  const removeGastoMut = useMutation({
    mutationFn: (item: number) => removeGastoOT(Number(id), item),
    onSuccess: refresh,
  });

  if (isLoading) return <div className="p-6"><div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" /><div className="h-64 bg-gray-100 rounded-xl animate-pulse" /></div>;
  if (!ot) return <div className="p-6 text-gray-500">OT no encontrada</div>;

  const tipos = tiposData ?? [];
  const monedas = monedasData ?? [];
  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">OT #{ot.ot_nro}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ot.ot_cli_nom} {ot.ot_clave_ped ? `\u00b7 Pedido #${ot.ot_clave_ped}` : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/prd/ordenes-trabajo')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Volver</button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      {/* Datos principales */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-4">Datos de la OT</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha emisi{'\u00f3'}n</label><input type="date" defaultValue={ot.ot_fec_emis?.split('T')[0]} onBlur={(e) => updateMut.mutate({ ot_fec_emis: e.target.value })} className={inp} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select defaultValue={ot.ot_tipo ?? ''} onChange={(e) => updateMut.mutate({ ot_tipo: Number(e.target.value) || null })} className={inp}>
              <option value="">--</option>
              {tipos.map((t) => <option key={t.tipo_codigo} value={t.tipo_codigo}>{t.tipo_desc}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Situaci{'\u00f3'}n</label>
            <select defaultValue={ot.ot_situacion ?? 1} onChange={(e) => updateMut.mutate({ ot_situacion: Number(e.target.value) })} className={inp}>
              {Object.entries(SIT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select defaultValue={ot.ot_mon ?? 1} onChange={(e) => updateMut.mutate({ ot_mon: Number(e.target.value) })} className={inp}>
              {monedas.map((m) => <option key={m.mon_codigo} value={m.mon_codigo}>{m.mon_desc}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Descripci{'\u00f3'}n</label><input defaultValue={ot.ot_desc ?? ''} onBlur={(e) => updateMut.mutate({ ot_desc: e.target.value })} className={inp} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label><input readOnly value={ot.ot_cli_nom ?? ''} className={`${inp} bg-gray-50`} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label><input defaultValue={ot.ot_contacto ?? ''} onBlur={(e) => updateMut.mutate({ ot_contacto: e.target.value })} className={inp} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Producto</label><input defaultValue={ot.ot_nom_producto ?? ''} onBlur={(e) => updateMut.mutate({ ot_nom_producto: e.target.value })} className={inp} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label><input defaultValue={ot.ot_concepto ?? ''} onBlur={(e) => updateMut.mutate({ ot_concepto: e.target.value })} className={inp} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Fec. entrega</label><input type="date" defaultValue={ot.ot_fec_ent?.split('T')[0] ?? ''} onBlur={(e) => updateMut.mutate({ ot_fec_ent: e.target.value || null })} className={inp} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Fec. prev. term.</label><input type="date" defaultValue={ot.ot_fec_prev_term?.split('T')[0] ?? ''} onBlur={(e) => updateMut.mutate({ ot_fec_prev_term: e.target.value || null })} className={inp} /></div>
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4"><label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label><textarea defaultValue={ot.ot_obs ?? ''} rows={2} onBlur={(e) => updateMut.mutate({ ot_obs: e.target.value })} className={`${inp} resize-none`} /></div>
        </div>
      </div>

      {/* Gastos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Gastos</h2>
          <button onClick={() => setShowGastoForm(true)} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"><Plus size={14} /> Agregar</button>
        </div>

        {showGastoForm && (
          <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <input placeholder="Proveedor" onChange={(e) => setGastoForm((f) => ({ ...f, gast_prov_nom: e.target.value }))} className={inp} />
              <input placeholder="Detalle" onChange={(e) => setGastoForm((f) => ({ ...f, gast_detalle: e.target.value }))} className={inp} />
              <input type="number" placeholder="Monto neto" onChange={(e) => setGastoForm((f) => ({ ...f, gast_neto_mon: parseFloat(e.target.value) || 0, gast_neto_loc: parseFloat(e.target.value) || 0 }))} className={inp} />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setShowGastoForm(false)} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Cancelar</button>
              <button onClick={() => addGastoMut.mutate(gastoForm)} className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700">Guardar</button>
            </div>
          </div>
        )}

        {(ot.gastos ?? []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead><tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                <th className="py-2 px-2 w-8">#</th><th className="py-2 px-2">Proveedor</th><th className="py-2 px-2">Detalle</th>
                <th className="py-2 px-2 text-right w-24">Fecha</th><th className="py-2 px-2 text-right w-28">Neto</th><th className="py-2 px-2 w-8"></th>
              </tr></thead>
              <tbody>
                {(ot.gastos ?? []).map((g) => (
                  <tr key={g.gast_nro_item} className="border-b border-gray-100">
                    <td className="py-1.5 px-2 text-xs text-gray-400">{g.gast_nro_item}</td>
                    <td className="py-1.5 px-2 text-gray-800">{g.gast_prov_nom ?? '\u2014'}</td>
                    <td className="py-1.5 px-2 text-gray-600">{g.gast_detalle ?? '\u2014'}</td>
                    <td className="py-1.5 px-2 text-right text-xs text-gray-500">{formatDate(g.gast_fec_emis)}</td>
                    <td className="py-1.5 px-2 text-right tabular-nums font-medium">{fmt(g.gast_neto_mon)}</td>
                    <td className="py-1.5 px-2"><button onClick={() => removeGastoMut.mutate(g.gast_nro_item)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="border-t-2 border-gray-200">
                <td colSpan={4} className="py-2 px-2 text-right text-sm font-semibold text-gray-700">Total gastos:</td>
                <td className="py-2 px-2 text-right tabular-nums font-bold text-gray-900">{fmt((ot.gastos ?? []).reduce((s, g) => s + Number(g.gast_neto_mon || 0), 0))}</td>
                <td></td>
              </tr></tfoot>
            </table>
          </div>
        ) : !showGastoForm && <p className="text-sm text-gray-400 text-center py-4">Sin gastos registrados</p>}
      </div>

      {/* Eventos */}
      {(ot.eventos ?? []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3">Historial de eventos</h2>
          <div className="space-y-2">
            {(ot.eventos ?? []).map((e) => (
              <div key={e.eot_clave} className="flex items-start gap-3 text-sm border-b border-gray-50 pb-2">
                <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{formatDate(e.eot_fec_evento)}</span>
                <div className="flex-1">
                  <span className="text-gray-700">{e.eot_desc_evento}</span>
                  {e.eot_user && <span className="text-xs text-gray-400 ml-2">({e.eot_user})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
