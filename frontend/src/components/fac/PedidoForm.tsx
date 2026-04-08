'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getClientes, getVendedores, getCondiciones, getArticulos, getMarcasCliente } from '@/services/fac';
import { getMonedas } from '@/services/gen';
import type { Pedido, PedidoDet, Articulo } from '@/types/fac';
import { Search, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { toInputDate, formatDate } from '@/lib/utils';

interface Props {
  initial?: Partial<Pedido>;
  onSave: (data: Partial<Pedido>) => Promise<void>;
  isPending: boolean;
  error?: string;
  tipo?: string;
}

const TIPO_LABEL: Record<string, string> = {
  V: 'Venta', C: 'Contrato', I: 'Interno', M: 'Muestra', D: 'Dise\u00f1o',
};

const empty: Partial<Pedido> = {
  ped_fecha: new Date().toISOString().split('T')[0],
  ped_cli: undefined as unknown as number,
  ped_vendedor: null,
  ped_cond_venta: '',
  ped_mon: 1,
  ped_producto: '',
  ped_concepto: '',
  ped_obs: '',
  ped_estado: 'P',
  ped_ind_prd: 'N',
  ped_contacto: '',
  ped_tel: '',
  ped_ruc: '',
  ped_nro_orco: null,
  ped_fec_orco: null,
  ped_fec_entreg_req: null,
  ped_fec_entreg_prd: null,
  ped_tipo_fac: null,
  ped_dep: null,
  ped_ind_hab_fac: 'S',
  ped_ind_req_rem: 'N',
  ped_ind_gar_fun: 'N',
  ped_dias_validez: null,
  ped_tiempo_realiz: '',
  ped_tasa_us: 0,
  ped_cli_porc_ex: 0,
  ped_porc_dto: 0,
  ped_porc_rgo: 0,
  ped_fto_imp: 1,
  ped_list_precio: null,
  items: [],
};

const fmtNum = (n?: number | null) =>
  n != null ? new Intl.NumberFormat('es-PY').format(Number(n)) : '0';

// ─── Collapsible section ────────────────────────────────────────────────────
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

// ─── Item detail panel (expandable row) ─────────────────────────────────────
function ItemDetailPanel({ it, idx, updateItem }: { it: PedidoDet; idx: number; updateItem: (idx: number, field: keyof PedidoDet, value: unknown) => void }) {
  const inp = "w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400";
  const lbl = "block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5";
  const upd = (field: keyof PedidoDet) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.type === 'number' ? (parseFloat(e.target.value) || null) : (e.target.value || null);
    updateItem(idx, field, v);
  };

  return (
    <tr>
      <td colSpan={9} className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
          {/* Produccion */}
          <div className="col-span-full"><span className="text-[10px] font-bold text-gray-600 uppercase">Producci&oacute;n</span></div>
          <div><label className={lbl}>Tipo OT</label><input type="number" className={inp} value={it.pdet_tipo_ot ?? ''} onChange={upd('pdet_tipo_ot')} /></div>
          <div><label className={lbl}>Tipo Prod.</label><input className={inp} value={it.pdet_tipo_prod ?? ''} onChange={upd('pdet_tipo_prod')} /></div>
          <div><label className={lbl}>Calidad Imp.</label><input type="number" className={inp} value={it.pdet_calid_imp ?? ''} onChange={upd('pdet_calid_imp')} /></div>
          <div><label className={lbl}>Ind.Medida</label><input className={inp} maxLength={1} value={it.pdet_ind_med ?? ''} onChange={upd('pdet_ind_med')} /></div>
          <div><label className={lbl}>Ind.Imp.Dig.</label><input className={inp} maxLength={1} value={it.pdet_ind_imp_dig ?? ''} onChange={upd('pdet_ind_imp_dig')} /></div>
          <div><label className={lbl}>Resoluci&oacute;n</label><input className={inp} value={it.pdet_resolucion ?? ''} onChange={upd('pdet_resolucion')} /></div>
          <div><label className={lbl}>Lados Imp.</label><input type="number" className={inp} value={it.pdet_nro_lados_imp ?? ''} onChange={upd('pdet_nro_lados_imp')} /></div>
          <div><label className={lbl}>Prueba Color</label><input className={inp} maxLength={1} value={it.pdet_ind_pru_color ?? ''} onChange={upd('pdet_ind_pru_color')} /></div>
          <div><label className={lbl}>Dise&ntilde;o</label><input className={inp} maxLength={1} value={it.pdet_ind_disenho ?? ''} onChange={upd('pdet_ind_disenho')} /></div>

          {/* Dimensiones */}
          <div className="col-span-full mt-2"><span className="text-[10px] font-bold text-gray-600 uppercase">Dimensiones</span></div>
          <div><label className={lbl}>Base</label><input type="number" step="0.0001" className={inp} value={it.pdet_med_base ?? ''} onChange={upd('pdet_med_base')} /></div>
          <div><label className={lbl}>Altura</label><input type="number" step="0.0001" className={inp} value={it.pdet_med_alto ?? ''} onChange={upd('pdet_med_alto')} /></div>
          <div><label className={lbl}>Total</label><input type="number" step="0.0001" className={inp} value={it.pdet_med_total ?? ''} onChange={upd('pdet_med_total')} /></div>
          <div><label className={lbl}>Base (T)</label><input type="number" step="0.0001" className={inp} value={it.pdet_med_base_t ?? ''} onChange={upd('pdet_med_base_t')} /></div>
          <div><label className={lbl}>Altura (T)</label><input type="number" step="0.0001" className={inp} value={it.pdet_med_alto_t ?? ''} onChange={upd('pdet_med_alto_t')} /></div>
          <div><label className={lbl}>Total (T)</label><input type="number" step="0.0001" className={inp} value={it.pdet_med_total_t ?? ''} onChange={upd('pdet_med_total_t')} /></div>

          {/* Costos */}
          <div className="col-span-full mt-2"><span className="text-[10px] font-bold text-gray-600 uppercase">Costos</span></div>
          <div><label className={lbl}>Costo Art.</label><input type="number" step="0.01" className={inp} value={it.pdet_costo_ar ?? ''} onChange={upd('pdet_costo_ar')} /></div>
          <div><label className={lbl}>Costo Tot.</label><input type="number" step="0.01" className={inp} value={it.pdet_costo_tot ?? ''} onChange={upd('pdet_costo_tot')} /></div>
          <div><label className={lbl}>Precio Lista</label><input type="number" step="0.01" className={inp} value={it.pdet_precio_lista ?? ''} onChange={upd('pdet_precio_lista')} /></div>
          <div><label className={lbl}>Cant. Prod.</label><input type="number" step="0.01" className={inp} value={it.pdet_cant_prod ?? ''} onChange={upd('pdet_cant_prod')} /></div>
          <div><label className={lbl}>Contenido</label><input type="number" step="0.001" className={inp} value={it.pdet_contenido ?? ''} onChange={upd('pdet_contenido')} /></div>

          {/* Facturacion */}
          <div className="col-span-full mt-2"><span className="text-[10px] font-bold text-gray-600 uppercase">Facturaci&oacute;n</span></div>
          <div><label className={lbl}>Cant.Fact.</label><input type="number" step="0.01" value={it.pdet_cant_fact ?? ''} readOnly tabIndex={-1} className={`${inp} bg-gray-100`} /></div>
          <div><label className={lbl}>Docs FA</label><input type="number" className={`${inp} bg-gray-100`} value={it.pdet_cant_doc_fa ?? ''} readOnly /></div>
          <div><label className={lbl}>Docs NC</label><input type="number" className={`${inp} bg-gray-100`} value={it.pdet_cant_doc_nc ?? ''} readOnly /></div>
          <div><label className={lbl}>Imp.Factu.</label><input type="number" className={`${inp} bg-gray-100`} value={it.pdet_imp_factu ?? ''} readOnly /></div>
          <div><label className={lbl}>C&oacute;d.Impu.</label><input type="number" className={inp} value={it.pdet_cod_impu ?? ''} onChange={upd('pdet_cod_impu')} /></div>

          {/* Contratos / Fechas */}
          <div className="col-span-full mt-2"><span className="text-[10px] font-bold text-gray-600 uppercase">Contratos / Fechas</span></div>
          <div><label className={lbl}>Fec.Inicio</label><input type="date" className={inp} value={it.pdet_fec_ini_cont ?? ''} onChange={upd('pdet_fec_ini_cont')} /></div>
          <div><label className={lbl}>Fec.Fin</label><input type="date" className={inp} value={it.pdet_fec_fin_cont ?? ''} onChange={upd('pdet_fec_fin_cont')} /></div>
          <div><label className={lbl}>Duraci&oacute;n</label><input type="number" className={inp} value={it.pdet_duracion ?? ''} onChange={upd('pdet_duracion')} /></div>
          <div><label className={lbl}>Segundos</label><input type="number" className={inp} value={it.pdet_segundos ?? ''} onChange={upd('pdet_segundos')} /></div>
          <div><label className={lbl}>Inserciones</label><input type="number" className={inp} value={it.pdet_inserciones ?? ''} onChange={upd('pdet_inserciones')} /></div>
          <div><label className={lbl}>Tot.Seg/Día</label><input type="number" className={`${inp} bg-gray-100`} value={it.pdet_tot_seg_dia ?? ''} readOnly /></div>
          <div><label className={lbl}>Bonif.</label><input className={inp} maxLength={1} value={it.pdet_art_bonif ?? ''} onChange={upd('pdet_art_bonif')} /></div>

          {/* Indicadores */}
          <div className="col-span-full mt-2"><span className="text-[10px] font-bold text-gray-600 uppercase">Indicadores</span></div>
          <div><label className={lbl}>Ind.Terc.</label><input className={inp} maxLength={1} value={it.pdet_ind_terc ?? ''} onChange={upd('pdet_ind_terc')} /></div>
          <div><label className={lbl}>Ind.STK</label><input className={inp} maxLength={1} value={it.pdet_ind_stk ?? ''} onChange={upd('pdet_ind_stk')} /></div>
          <div><label className={lbl}>Ind.VC</label><input className={inp} maxLength={1} value={it.pdet_ind_vc ?? ''} onChange={upd('pdet_ind_vc')} /></div>
          <div><label className={lbl}>Cod.Barra</label><input className={inp} value={it.pdet_codigo_barra ?? ''} onChange={upd('pdet_codigo_barra')} /></div>

          {/* Observacion */}
          <div className="col-span-full mt-2">
            <label className={lbl}>Observaci&oacute;n del item</label>
            <textarea className={`${inp} resize-none`} rows={2} value={it.pdet_obs ?? ''} onChange={upd('pdet_obs')} />
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main form ──────────────────────────────────────────────────────────────
export default function PedidoForm({ initial, onSave, isPending, error, tipo = 'V' }: Props) {
  const label = TIPO_LABEL[tipo] ? `pedido (${TIPO_LABEL[tipo]})` : 'pedido';
  const router = useRouter();
  const [form, setForm] = useState<Partial<Pedido>>(() => {
    const merged = { ...empty, ...initial };
    // Convertir fechas ISO a yyyy-mm-dd para inputs type="date"
    merged.ped_fecha = toInputDate(merged.ped_fecha) || new Date().toISOString().split('T')[0];
    merged.ped_fec_orco = toInputDate(merged.ped_fec_orco) || null;
    merged.ped_fec_entreg_req = toInputDate(merged.ped_fec_entreg_req) || null;
    merged.ped_fec_entreg_prd = toInputDate(merged.ped_fec_entreg_prd) || null;
    merged.ped_fec_cierre = toInputDate(merged.ped_fec_cierre) || null;
    merged.ped_fec_envio = toInputDate(merged.ped_fec_envio) || null;
    return merged;
  });
  const [items, setItems] = useState<PedidoDet[]>(() =>
    (initial?.items ?? []).map((it) => ({
      ...it,
      pdet_fec_ini_cont: toInputDate(it.pdet_fec_ini_cont) || null,
      pdet_fec_fin_cont: toInputDate(it.pdet_fec_fin_cont) || null,
    }))
  );
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Article search state
  const [artSearch, setArtSearch] = useState('');
  const [debouncedArtSearch, setDebouncedArtSearch] = useState('');
  const [artDropOpen, setArtDropOpen] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);

  // Client search state
  const [cliSearch, setCliSearch] = useState(initial?.cli_nom ?? '');
  const [debouncedCliSearch, setDebouncedCliSearch] = useState('');
  const [cliDropOpen, setCliDropOpen] = useState(false);
  const cliRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedArtSearch(artSearch), 400);
    return () => clearTimeout(t);
  }, [artSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCliSearch(cliSearch), 400);
    return () => clearTimeout(t);
  }, [cliSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (artRef.current && !artRef.current.contains(e.target as Node)) setArtDropOpen(false);
      if (cliRef.current && !cliRef.current.contains(e.target as Node)) setCliDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: cliData } = useQuery({
    queryKey: ['clientes-search', debouncedCliSearch],
    queryFn: () => getClientes({ search: debouncedCliSearch, limit: 10 }),
    enabled: cliDropOpen && debouncedCliSearch.length >= 2,
  });

  const { data: condData } = useQuery({ queryKey: ['condiciones'], queryFn: getCondiciones });
  const { data: vendData } = useQuery({ queryKey: ['vendedores', { all: true }], queryFn: () => getVendedores({ all: true }) });
  const { data: monData } = useQuery({ queryKey: ['monedas'], queryFn: getMonedas });

  const clienteId = form.ped_cli as number | undefined;
  const { data: marcasData } = useQuery({
    queryKey: ['marcas-cliente', clienteId],
    queryFn: () => getMarcasCliente(clienteId!),
    enabled: !!clienteId,
  });

  const { data: artData } = useQuery({
    queryKey: ['articulos-search', debouncedArtSearch],
    queryFn: () => getArticulos({ search: debouncedArtSearch, limit: 10 }),
    enabled: artDropOpen && debouncedArtSearch.length >= 2,
  });

  const set = (k: keyof Pedido, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const selectCliente = (c: { cli_codigo: number; cli_nom: string; cli_ruc?: string | null; cli_tel?: string | null; cli_dir2?: string | null; cli_pers_contacto?: string | null; cli_vendedor?: number | null; cli_tipo_vta?: string | null; cli_cond_venta?: string | null }) => {
    set('ped_cli', c.cli_codigo);
    set('ped_cli_nom', c.cli_nom);
    set('ped_cli_ruc', c.cli_ruc || null);
    set('ped_cli_tel', c.cli_tel || null);
    set('ped_cli_dir', c.cli_dir2 || null);
    set('ped_ruc', c.cli_ruc || null);
    set('ped_tel', c.cli_tel || null);
    set('ped_contacto', c.cli_pers_contacto || null);
    if (c.cli_vendedor) set('ped_vendedor', c.cli_vendedor);
    set('ped_ind_tipo', c.cli_tipo_vta || 'C');
    set('ped_cond_venta', c.cli_cond_venta || 'CONTADO');
    setCliSearch(c.cli_nom);
    setCliDropOpen(false);
  };

  const addArticulo = (art: Articulo) => {
    setItems((prev) => [
      ...prev,
      {
        pdet_art: art.art_codigo,
        art_desc: art.art_desc,
        art_unid_med: art.art_unid_med,
        pdet_um_ped: art.art_unid_med || 'U',
        pdet_cant_ped: 1,
        pdet_precio: 0,
        pdet_porc_dcto: 0,
        pdet_desc_larga: art.art_desc,
      },
    ]);
    setArtSearch('');
    setArtDropOpen(false);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setExpandedRows((prev) => { const n = new Set(prev); n.delete(idx); return n; });
  };

  const updateItem = (idx: number, field: keyof PedidoDet, value: unknown) => {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx); else n.add(idx);
      return n;
    });
  };

  const calcNeto = (it: PedidoDet) =>
    parseFloat(String(it.pdet_cant_ped || 0)) * parseFloat(String(it.pdet_precio || 0)) * (1 - parseFloat(String(it.pdet_porc_dcto || 0)) / 100);

  const subtotal = items.reduce((s, it) => s + parseFloat(String(it.pdet_cant_ped || 0)) * parseFloat(String(it.pdet_precio || 0)), 0);
  const totalDcto = items.reduce((s, it) => {
    const bruto = parseFloat(String(it.pdet_cant_ped || 0)) * parseFloat(String(it.pdet_precio || 0));
    return s + bruto * (parseFloat(String(it.pdet_porc_dcto || 0)) / 100);
  }, 0);
  const total = items.reduce((s, it) => s + calcNeto(it), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...form, items });
  };

  const vendedores = vendData?.data ?? [];
  const condiciones = condData ?? [];
  const monedas = monData ?? [];
  const marcas = marcasData ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ──────────── DATOS PRINCIPALES ──────────── */}
      <Section title={`Datos del ${label}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Nro (readonly) */}
          {initial?.ped_nro && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input readOnly tabIndex={-1} value={initial.ped_nro} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
            <input type="date" value={form.ped_fecha ?? ''} readOnly
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>

          {/* Estado (solo visible en edición, no editable) */}
          {initial && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input readOnly tabIndex={-1} value={form.ped_estado === 'A' ? 'Aprobado' : form.ped_estado === 'C' ? 'Cerrado' : 'Pendiente'}
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
            </div>
          )}

          {/* De Produccion (solo en edición) */}
          {initial && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">De Producción</label>
              <select value={form.ped_ind_prd ?? 'N'} onChange={(e) => set('ped_ind_prd', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="N">No</option>
                <option value="S">Sí</option>
              </select>
            </div>
          )}

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select value={form.ped_mon ?? 1} onChange={(e) => set('ped_mon', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {monedas.map((m) => (
                <option key={m.mon_codigo} value={m.mon_codigo}>{m.mon_desc}</option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div className="sm:col-span-2" ref={cliRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente <span className="text-red-500">*</span></label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={cliSearch}
                onChange={(e) => { setCliSearch(e.target.value); setCliDropOpen(true); if (!e.target.value) { set('ped_cli', undefined as unknown as number); } }}
                onFocus={() => setCliDropOpen(true)}
                placeholder="Buscar cliente por nombre o RUC..."
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {cliDropOpen && cliSearch.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {(cliData?.data ?? []).length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                  ) : (
                    (cliData?.data ?? []).map((c) => {
                      const inactivo = c.cli_est_cli === 'I';
                      return (
                        <button key={c.cli_codigo} type="button"
                          onClick={() => { if (!inactivo) selectCliente(c); }}
                          disabled={inactivo}
                          className={`w-full text-left px-3 py-2 text-sm ${inactivo ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'hover:bg-primary-50 hover:text-primary-700'}`}>
                          <span className={inactivo ? 'font-medium line-through' : 'font-medium'}>{c.cli_nom}</span>
                          {c.cli_ruc && <span className={`ml-2 text-xs ${inactivo ? 'text-gray-300' : 'text-gray-400'}`}>{c.cli_ruc}</span>}
                          {inactivo && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-400">Inactivo</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tipo de venta (readonly, viene del cliente) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de venta</label>
            <input readOnly tabIndex={-1} value={form.ped_ind_tipo === 'C' ? 'Contado' : form.ped_ind_tipo === 'R' ? 'Crédito' : ''}
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>

          {/* Cond. de venta (readonly, viene del cliente) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cond. de venta</label>
            <input readOnly tabIndex={-1} value={form.ped_cond_venta ?? ''}
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>

          {/* Vendedor (readonly, viene del cliente) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
            <select value={form.ped_vendedor ?? ''} disabled tabIndex={-1}
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
              <option value="">— Sin vendedor —</option>
              {vendedores.map((v) => (
                <option key={v.vend_legajo} value={v.vend_legajo}>
                  {v.oper_nombre} {v.oper_apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Contacto (readonly, viene del cliente) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
            <input readOnly tabIndex={-1} value={form.ped_contacto ?? ''}
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input readOnly tabIndex={-1} value={form.ped_tel ?? ''}
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
            <input readOnly tabIndex={-1} value={form.ped_ruc ?? ''}
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <select value={form.ped_campanha ?? ''} onChange={(e) => set('ped_campanha', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">{'\u2014'} Sin marca {'\u2014'}</option>
              {marcas.map((m) => (
                <option key={m.camp_nro} value={m.camp_nro}>{m.camp_nombre}</option>
              ))}
            </select>
          </div>

          {/* %Exoneración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% Exoner.</label>
            <input type="number" min="0" max="100" step="0.01" value={form.ped_cli_porc_ex ?? 0}
              onChange={(e) => set('ped_cli_porc_ex', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Producto */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto / Descripci&oacute;n</label>
            <input value={form.ped_producto ?? ''} onChange={(e) => set('ped_producto', e.target.value)}
              placeholder={`Descripci\u00f3n general del ${label}`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
            <input value={form.ped_concepto ?? ''} onChange={(e) => set('ped_concepto', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Tasa U$ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa U$</label>
            <input type="number" step="0.000001" value={form.ped_tasa_us ?? 0}
              onChange={(e) => set('ped_tasa_us', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Observaciones */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea value={form.ped_obs ?? ''} onChange={(e) => set('ped_obs', e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
        </div>
      </Section>

      {/* ──────────── FECHAS Y LOGÍSTICA ──────────── */}
      <Section title="Fechas y Log&iacute;stica" defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ord.Compra N&ordm;</label>
            <input type="number" value={form.ped_nro_orco ?? ''} onChange={(e) => set('ped_nro_orco', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fec.Ord.Compra</label>
            <input type="date" value={form.ped_fec_orco ?? ''} onChange={(e) => set('ped_fec_orco', e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fec.Entreg.Requerida</label>
            <input type="date" value={form.ped_fec_entreg_req ?? ''} onChange={(e) => set('ped_fec_entreg_req', e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fec.Entreg.Producci&oacute;n</label>
            <input type="date" value={form.ped_fec_entreg_prd ?? ''} onChange={(e) => set('ped_fec_entreg_prd', e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fec.Cierre</label>
            <input type="date" value={form.ped_fec_cierre ?? ''} onChange={(e) => set('ped_fec_cierre', e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fec.Env&iacute;o</label>
            <input type="date" value={form.ped_fec_envio ?? ''} onChange={(e) => set('ped_fec_envio', e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo Realizaci&oacute;n</label>
            <input value={form.ped_tiempo_realiz ?? ''} onChange={(e) => set('ped_tiempo_realiz', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">D&iacute;as Validez</label>
            <input type="number" value={form.ped_dias_validez ?? ''} onChange={(e) => set('ped_dias_validez', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.ped_ind_req_rem === 'S'}
                onChange={(e) => set('ped_ind_req_rem', e.target.checked ? 'S' : 'N')}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              Entrega c/ Remisi&oacute;n
            </label>
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.ped_ind_gar_fun === 'S'}
                onChange={(e) => set('ped_ind_gar_fun', e.target.checked ? 'S' : 'N')}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              Garant&iacute;a Funcionario
            </label>
          </div>
        </div>
      </Section>

      {/* ──────────── FACTURACIÓN ──────────── */}
      <Section title="Facturaci&oacute;n" defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Factura</label>
            <select value={form.ped_tipo_fac ?? ''} onChange={(e) => set('ped_tipo_fac', e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">—</option>
              <option value="CO">Contado</option>
              <option value="CR">Cr&eacute;dito</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formato Imp.</label>
            <select value={form.ped_fto_imp ?? ''} onChange={(e) => set('ped_fto_imp', e.target.value !== '' ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="1">1 - Detalle con precio por l&iacute;nea</option>
              <option value="2">2 - Detalle con precio &uacute;nico final</option>
              <option value="3">3 - Texto largo a definir al facturar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lista Precio</label>
            <input type="number" value={form.ped_list_precio ?? ''} onChange={(e) => set('ped_list_precio', e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% Dto. General</label>
            <input type="number" min="0" max="100" step="0.01" value={form.ped_porc_dto ?? 0}
              onChange={(e) => set('ped_porc_dto', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% Recargo</label>
            <input type="number" min="0" max="100" step="0.01" value={form.ped_porc_rgo ?? 0}
              onChange={(e) => set('ped_porc_rgo', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ind. Facturación</label>
            <select value={form.ped_ind_fac ?? ''} onChange={(e) => set('ped_ind_fac', e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">—</option>
              <option value="P">Parcial</option>
              <option value="T">Total</option>
              <option value="N">No facturado</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ──────────── AUDITORÍA ──────────── */}
      {initial?.ped_clave && (
        <Section title="Auditoría" defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operador</label>
              <input readOnly tabIndex={-1} value={initial.ped_operador ?? ''} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login Grabación</label>
              <input readOnly tabIndex={-1} value={initial.ped_login ?? ''} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Grabación</label>
              <input readOnly tabIndex={-1} value={formatDate(initial.ped_fec_grab)} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login Autorización</label>
              <input readOnly tabIndex={-1} value={initial.ped_login_auto ?? ''} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Autorización</label>
              <input readOnly tabIndex={-1} value={formatDate(initial.ped_fech_auto)} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Procesado</label>
              <input readOnly tabIndex={-1} value={initial.ped_procesado === 'S' ? 'Sí' : 'No'} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
            </div>
          </div>
        </Section>
      )}

      {/* ──────────── ITEMS ──────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Items del {label}</h2>
        </div>

        {/* Article search */}
        <div className="mb-4" ref={artRef}>
          <div className="relative">
            <Plus size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={artSearch}
              onChange={(e) => { setArtSearch(e.target.value); setArtDropOpen(true); }}
              onFocus={() => setArtDropOpen(true)}
              placeholder="Buscar art&iacute;culo para agregar..."
              className="w-full sm:w-96 pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {artDropOpen && artSearch.length >= 2 && (
              <div className="absolute z-10 w-full sm:w-96 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {(artData?.data ?? []).length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                ) : (
                  (artData?.data ?? []).map((a) => (
                    <button key={a.art_codigo} type="button"
                      onClick={() => addArticulo(a)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700">
                      <span className="font-medium">{a.art_desc}</span>
                      <span className="text-gray-400 ml-2 text-xs">{a.art_unid_med}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Items table */}
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="w-6 pb-2"></th>
                  <th className="text-left pb-2 pr-2 w-10">#</th>
                  <th className="text-left pb-2 pr-3">Art&iacute;culo</th>
                  <th className="text-left pb-2 pr-3 w-16">UM</th>
                  <th className="text-right pb-2 pr-3 w-24">Cantidad</th>
                  <th className="text-right pb-2 pr-3 w-20">Fec.Ini.</th>
                  <th className="text-right pb-2 pr-3 w-28">Precio</th>
                  <th className="text-right pb-2 pr-3 w-16">Durac.</th>
                  <th className="text-right pb-2 pr-3 w-18">% Dto.</th>
                  <th className="text-right pb-2 pr-3 w-24">Dcto.Det.</th>
                  <th className="text-right pb-2 pr-3 w-28">Neto</th>
                  <th className="w-8 pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <>
                    <tr key={`row-${idx}`} className="border-b border-gray-50">
                      <td className="py-1.5">
                        <button type="button" onClick={() => toggleRow(idx)}
                          className="p-0.5 text-gray-400 hover:text-primary-600 rounded transition">
                          {expandedRows.has(idx) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                      <td className="py-1.5 pr-2 text-xs text-gray-400 tabular-nums">{idx + 1}</td>
                      <td className="py-1.5 pr-3">
                        <div className="font-medium text-gray-800 text-xs">{it.art_desc}</div>
                        <input value={it.pdet_desc_larga ?? ''} onChange={(e) => updateItem(idx, 'pdet_desc_larga', e.target.value)}
                          className="w-full mt-0.5 border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-400"
                          placeholder="Descripci&oacute;n larga..." />
                      </td>
                      <td className="py-1.5 pr-3">
                        <input value={it.pdet_um_ped} onChange={(e) => updateItem(idx, 'pdet_um_ped', e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary-400" />
                      </td>
                      <td className="py-1.5 pr-3">
                        <input type="number" min="0" step="0.01" value={it.pdet_cant_ped}
                          onChange={(e) => updateItem(idx, 'pdet_cant_ped', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400" />
                      </td>
                      <td className="py-1.5 pr-3">
                        <input type="date" value={it.pdet_fec_ini_cont ?? ''}
                          onChange={(e) => updateItem(idx, 'pdet_fec_ini_cont', e.target.value || null)}
                          className="w-full border border-gray-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400" />
                      </td>
                      <td className="py-1.5 pr-3">
                        <input type="number" min="0" step="0.01" value={it.pdet_precio}
                          onChange={(e) => updateItem(idx, 'pdet_precio', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400" />
                      </td>
                      <td className="py-1.5 pr-3">
                        <input type="number" min="0" value={it.pdet_duracion ?? ''}
                          onChange={(e) => updateItem(idx, 'pdet_duracion', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400" />
                      </td>
                      <td className="py-1.5 pr-3">
                        <input type="number" min="0" max="100" step="0.01" value={it.pdet_porc_dcto}
                          onChange={(e) => updateItem(idx, 'pdet_porc_dcto', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400" />
                      </td>
                      <td className="py-1.5 pr-3">
                        <input type="number" min="0" step="0.01" value={it.pdet_imp_dcto_det ?? 0}
                          onChange={(e) => updateItem(idx, 'pdet_imp_dcto_det', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400" />
                      </td>
                      <td className="py-1.5 pr-3 text-right text-gray-700 tabular-nums text-xs">
                        {fmtNum(calcNeto(it))}
                      </td>
                      <td className="py-1.5">
                        <button type="button" onClick={() => removeItem(idx)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded transition">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(idx) && (
                      <ItemDetailPanel key={`detail-${idx}`} it={it} idx={idx} updateItem={updateItem} />
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No hay art&iacute;culos. Busca arriba para agregar.</p>
        )}

        {/* ──────────── TOTALES ──────────── */}
        {items.length > 0 && (
          <div className="mt-4 flex justify-end">
            <div className="w-full sm:w-72 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>SUB.TOTAL</span>
                <span className="tabular-nums">{fmtNum(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>DCTO.GRAL.</span>
                <span className="tabular-nums">{fmtNum(totalDcto)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800 border-t border-gray-200 pt-1">
                <span>TOTAL PED.</span>
                <span className="tabular-nums">{fmtNum(total)}</span>
              </div>
              <div className="flex justify-between text-yellow-700 font-medium">
                <span>TOT.FACTU.</span>
                <span className="tabular-nums">{fmtNum(initial?.ped_imp_facturado)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error + actions */}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
          {isPending ? 'Guardando\u2026' : `Guardar ${label}`}
        </button>
      </div>
    </form>
  );
}
