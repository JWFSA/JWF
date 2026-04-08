'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrdenTrabajo, updateOrdenTrabajo, addGastoOT, removeGastoOT, getTiposOT } from '@/services/prd';
import { getMonedas } from '@/services/gen';
import { formatDate } from '@/lib/utils';
import type { OrdenTrabajo } from '@/types/prd';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';

const SIT: Record<number, { label: string; cls: string }> = {
  0: { label: 'Ingresada',   cls: 'bg-gray-100 text-gray-600' },
  1: { label: 'Abierta',     cls: 'bg-blue-100 text-blue-700' },
  2: { label: 'En proceso',  cls: 'bg-yellow-100 text-yellow-700' },
  3: { label: 'Terminada',   cls: 'bg-green-100 text-green-700' },
  4: { label: 'Facturada',   cls: 'bg-purple-100 text-purple-700' },
};

const EST_DISENHO: Record<number, string> = { 1: 'Pendiente', 2: 'Terminado' };
const EST_PLAN: Record<number, string> = { 1: 'Pendiente', 2: 'Aprobado' };

const fmt = (n?: number | string | null) => n != null ? new Intl.NumberFormat('es-PY').format(Number(n)) : '\u2014';

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:px-6 text-left hover:bg-gray-50 transition-colors rounded-t-xl">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 sm:px-6 pb-4 sm:pb-6">{children}</div>}
    </div>
  );
}

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
  const ro = `${inp} bg-gray-50 text-gray-600`;
  const lbl = 'block text-sm font-medium text-gray-700 mb-1';
  const sitInfo = SIT[Number(ot.ot_situacion)] ?? { label: String(ot.ot_situacion ?? '\u2014'), cls: 'bg-gray-100 text-gray-500' };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-800">OT #{ot.ot_nro}</h1>
            {ot.ot_serie && <span className="text-sm text-gray-400">Serie {ot.ot_serie}</span>}
            <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-medium ${sitInfo.cls}`}>{sitInfo.label}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {ot.ot_cli_nom ?? ot.cli_nom_full}
            {ot.tipo_desc && <span> &middot; {ot.tipo_desc}</span>}
            {ot.ot_clave_ped && (
              <span> &middot; <a href={`/fac/pedidos/${ot.ot_clave_ped}`} className="text-primary-600 hover:text-primary-700 underline">Pedido #{ot.ped_nro ?? ot.ot_clave_ped}</a> (item {ot.ot_nro_item_ped})</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/prd/ordenes-trabajo')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Volver</button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      {/* Datos principales */}
      <Section title="Datos generales">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Fecha emisi&oacute;n</label><input type="date" defaultValue={ot.ot_fec_emis?.split('T')[0]} onBlur={(e) => updateMut.mutate({ ot_fec_emis: e.target.value })} className={inp} /></div>
          <div><label className={lbl}>Tipo</label>
            <select defaultValue={ot.ot_tipo ?? ''} onChange={(e) => updateMut.mutate({ ot_tipo: Number(e.target.value) || null })} className={inp}>
              <option value="">--</option>
              {tipos.map((t) => <option key={t.tipo_codigo} value={t.tipo_codigo}>{t.tipo_desc}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Situaci&oacute;n</label>
            <select defaultValue={ot.ot_situacion ?? 0} onChange={(e) => updateMut.mutate({ ot_situacion: Number(e.target.value) })} className={inp}>
              {Object.entries(SIT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div><label className={lbl}>Moneda</label>
            <select defaultValue={ot.ot_mon ?? 1} onChange={(e) => updateMut.mutate({ ot_mon: Number(e.target.value) })} className={inp}>
              {monedas.map((m) => <option key={m.mon_codigo} value={m.mon_codigo}>{m.mon_desc}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className={lbl}>Descripci&oacute;n</label><input defaultValue={ot.ot_desc ?? ''} onBlur={(e) => updateMut.mutate({ ot_desc: e.target.value })} className={inp} /></div>
          <div><label className={lbl}>Cliente</label><input readOnly value={`${ot.ot_cli_nom ?? ''} (${ot.ot_cli ?? ''})`} className={ro} /></div>
          <div><label className={lbl}>Tel&eacute;fono</label><input readOnly value={ot.ot_cli_tel ?? ''} className={ro} /></div>
          <div><label className={lbl}>Contacto OT</label><input defaultValue={ot.ot_contacto ?? ''} onBlur={(e) => updateMut.mutate({ ot_contacto: e.target.value })} className={inp} /></div>
          <div><label className={lbl}>Contacto Cliente</label><input readOnly value={ot.ot_cli_contacto ?? ''} className={ro} /></div>
          <div><label className={lbl}>Producto</label><input defaultValue={ot.ot_nom_producto ?? ''} onBlur={(e) => updateMut.mutate({ ot_nom_producto: e.target.value })} className={inp} /></div>
          <div><label className={lbl}>Concepto</label><input defaultValue={ot.ot_concepto ?? ''} onBlur={(e) => updateMut.mutate({ ot_concepto: e.target.value })} className={inp} /></div>
          <div><label className={lbl}>Cantidad</label><input readOnly value={ot.ot_cant_p != null ? `${ot.ot_cant_p} ${ot.ot_um ?? ''}` : '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Usuario</label><input readOnly value={ot.ot_user ?? ''} className={ro} /></div>
        </div>
      </Section>

      {/* Fechas y Plazos */}
      <Section title="Fechas y plazos" defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Fec. entrega</label><input type="date" defaultValue={ot.ot_fec_ent?.split('T')[0] ?? ''} onBlur={(e) => updateMut.mutate({ ot_fec_ent: e.target.value || null })} className={inp} /></div>
          <div><label className={lbl}>Fec. prev. terminaci&oacute;n</label><input type="date" defaultValue={ot.ot_fec_prev_term?.split('T')[0] ?? ''} onBlur={(e) => updateMut.mutate({ ot_fec_prev_term: e.target.value || null })} className={inp} /></div>
          <div><label className={lbl}>Fec. prev. term. PRD</label><input readOnly value={ot.ot_fec_prev_term_prd ? formatDate(ot.ot_fec_prev_term_prd) : '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Fec. liquidaci&oacute;n</label><input readOnly value={ot.ot_fec_liquidacion ? formatDate(ot.ot_fec_liquidacion) : '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Fec. l&iacute;m. perm. oper.</label><input readOnly value={ot.ot_fec_lim_perm_oper ? formatDate(ot.ot_fec_lim_perm_oper) : '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Cant. horas</label><input readOnly value={ot.ot_cant_horas ?? '\u2014'} className={ro} /></div>
        </div>
      </Section>

      {/* Diseño y Producción */}
      <Section title="Dise&ntilde;o y producci&oacute;n" defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Requiere dise&ntilde;o</label><input readOnly value={ot.ot_ind_disenho === 'S' ? 'S\u00ed' : 'No'} className={ro} /></div>
          <div><label className={lbl}>Estado dise&ntilde;o</label><input readOnly value={EST_DISENHO[Number(ot.ot_est_disenho)] ?? '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Estado plan</label><input readOnly value={EST_PLAN[Number(ot.ot_est_plan)] ?? '\u2014'} className={ro} /></div>
          <div><label className={lbl}>&Uacute;lt. fecha dise&ntilde;o</label><input readOnly value={ot.ot_fec_ult_dis ? formatDate(ot.ot_fec_ult_dis) : '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Dise&ntilde;ador</label><input readOnly value={ot.ot_disenhador ?? '\u2014'} className={ro} /></div>
          <div className="sm:col-span-2"><label className={lbl}>Ruta dise&ntilde;o</label><input defaultValue={ot.ot_ruta_disenho ?? ''} onBlur={(e) => updateMut.mutate({ ot_ruta_disenho: e.target.value || null })} className={inp} /></div>
          <div><label className={lbl}>Afecta stock</label><input readOnly value={ot.ot_ind_af_stock === 'S' ? 'S\u00ed' : 'No'} className={ro} /></div>
          <div><label className={lbl}>Marca</label><input readOnly value={ot.ot_desc_marca ?? (ot.ot_marca ? `C\u00f3d. ${ot.ot_marca}` : '\u2014')} className={ro} /></div>
          <div><label className={lbl}>Unidad</label><input readOnly value={ot.ot_desc_unidad ?? (ot.ot_unidad ? `C\u00f3d. ${ot.ot_unidad}` : '\u2014')} className={ro} /></div>
          <div><label className={lbl}>Responsable</label><input readOnly value={ot.ot_responsable ?? '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Procesado</label><input readOnly value={ot.ot_procesado === 'S' ? 'S\u00ed' : 'No'} className={ro} /></div>
        </div>
        {ot.ot_obs_retraso && (
          <div className="mt-3"><label className={lbl}>Obs. retraso</label><p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{ot.ot_obs_retraso}</p></div>
        )}
      </Section>

      {/* Costos y Porcentajes */}
      <Section title="Costos y m&aacute;rgenes" defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Costo moneda</label><input readOnly value={fmt(ot.ot_costo_mon)} className={ro} /></div>
          <div><label className={lbl}>Costo local</label><input readOnly value={fmt(ot.ot_costo_loc)} className={ro} /></div>
          <div><label className={lbl}>Imp. presup. instalaci&oacute;n</label><input readOnly value={fmt(ot.ot_imp_presup_instalac)} className={ro} /></div>
          <div><label className={lbl}>Imp. presup. equipos</label><input readOnly value={fmt(ot.ot_imp_presup_equipos)} className={ro} /></div>
          <div><label className={lbl}>L&iacute;mite costo</label><input readOnly value={fmt(ot.ot_imp_lim_costo)} className={ro} /></div>
          <div><label className={lbl}>Impuesto</label><input readOnly value={ot.ot_impu != null ? `C\u00f3d. ${ot.ot_impu}` : '\u2014'} className={ro} /></div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div><label className={lbl}>% Rec. materiales</label><input readOnly value={`${ot.ot_porc_reca_mat ?? 0}%`} className={ro} /></div>
          <div><label className={lbl}>% Util. materiales</label><input readOnly value={`${ot.ot_porc_util_mat ?? 0}%`} className={ro} /></div>
          <div><label className={lbl}>% Util. mat. imp.</label><input readOnly value={`${ot.ot_porc_util_mat_imp ?? 0}%`} className={ro} /></div>
          <div><label className={lbl}>% Rec. mano obra</label><input readOnly value={`${ot.ot_porc_reca_mano_obra ?? 0}%`} className={ro} /></div>
          <div><label className={lbl}>% Util. mano obra</label><input readOnly value={`${ot.ot_porc_util_mano_obra ?? 0}%`} className={ro} /></div>
          <div><label className={lbl}>% Rec. gastos var.</label><input readOnly value={`${ot.ot_porc_reca_gast_var ?? 0}%`} className={ro} /></div>
          <div><label className={lbl}>% Util. gastos var.</label><input readOnly value={`${ot.ot_porc_util_gast_var ?? 0}%`} className={ro} /></div>
        </div>
      </Section>

      {/* Referencias */}
      <Section title="Referencias" defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Pedido vinculado</label>
            {ot.ot_clave_ped ? (
              <a href={`/fac/pedidos/${ot.ot_clave_ped}`} className={`${ro} block text-primary-600 hover:text-primary-700 underline cursor-pointer`}>#{ot.ped_nro ?? ot.ot_clave_ped} (item {ot.ot_nro_item_ped ?? '\u2014'})</a>
            ) : (
              <input readOnly value={'\u2014'} className={ro} />
            )}
          </div>
          <div><label className={lbl}>Doc. factura</label><input readOnly value={ot.ot_clave_docu_fact ?? '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Doc. financiero</label><input readOnly value={ot.ot_clave_fin ?? '\u2014'} className={ro} /></div>
          <div><label className={lbl}>OT referencia</label><input readOnly value={ot.ot_nro_ot_ref ?? '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Relaci&oacute;n</label><input readOnly value={ot.ot_clave_relacion ? `${ot.ot_clave_relacion} / ${ot.ot_nro_relacion ?? ''}` : '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Cuad. demo</label><input readOnly value={ot.ot_cuad_demo ?? '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Legajo</label><input readOnly value={ot.ot_legajo ?? '\u2014'} className={ro} /></div>
          <div><label className={lbl}>Proveedor</label><input readOnly value={ot.ot_cod_proveedor ?? '\u2014'} className={ro} /></div>
        </div>
      </Section>

      {/* Observaciones */}
      {ot.ot_obs && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Observaciones</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{ot.ot_obs}</p>
        </div>
      )}

      {/* Gastos */}
      <Section title="Gastos">
        <div className="flex justify-end mb-3">
          <button onClick={() => setShowGastoForm(true)} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"><Plus size={14} /> Agregar gasto</button>
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
      </Section>

      {/* Eventos */}
      {(ot.eventos ?? []).length > 0 && (
        <Section title="Historial de eventos" defaultOpen={false}>
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
        </Section>
      )}
    </div>
  );
}
