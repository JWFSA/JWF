'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getZonas, getCategorias, getVendedores, getCondiciones, getAgencias } from '@/services/fac';
import { getPaises } from '@/services/gen';
import { Plus, X, Search } from 'lucide-react';

export interface ClienteFormData {
  cli_nom: string;
  cli_ruc: string;
  cli_tel: string;
  cli_fax: string;
  cli_emails: string[];
  cli_dir2: string;
  cli_localidad: string;
  cli_zona: number | '';
  cli_categ: number | '';
  cli_pais: number | '';
  cli_est_cli: 'A' | 'I';
  cli_imp_lim_cr: number;
  cli_bloq_lim_cr: 'S' | 'N';
  cli_max_dias_atraso: number;
  cli_ind_potencial: 'S' | 'N';
  cli_obs: string;
  cli_pers_contacto: string;
  cli_vendedor: number | '';
  cli_tipo_vta: 'C' | 'R' | '';
  cli_mod_venta: 'D' | 'I';
  cli_agencia: number | '';
  cli_comision_agen: number;
  cli_cond_venta: string;
}

export const emptyCliente: ClienteFormData = {
  cli_nom: '', cli_ruc: '', cli_tel: '', cli_fax: '', cli_emails: [''],
  cli_dir2: '', cli_localidad: '', cli_zona: '', cli_categ: '', cli_pais: '',
  cli_est_cli: 'A', cli_imp_lim_cr: 0, cli_bloq_lim_cr: 'N',
  cli_max_dias_atraso: 0, cli_ind_potencial: 'N', cli_obs: '', cli_pers_contacto: '',
  cli_vendedor: '',
  cli_tipo_vta: 'C',
  cli_mod_venta: 'D',
  cli_agencia: '',
  cli_comision_agen: 0,
  cli_cond_venta: 'CONTADO',
};

interface Props {
  form: ClienteFormData;
  onChange: (f: ClienteFormData) => void;
  error: string;
  isPending: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function ClienteForm({ form, onChange, error, isPending, onSubmit, onCancel, isEdit }: Props) {
  const set = (patch: Partial<ClienteFormData>) => onChange({ ...form, ...patch });
  const [agenSearch, setAgenSearch] = useState('');
  const [agenDropOpen, setAgenDropOpen] = useState(false);
  const agenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (agenRef.current && !agenRef.current.contains(e.target as Node)) setAgenDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: zonasData } = useQuery({ queryKey: ['zonas', { all: true }], queryFn: () => getZonas({ all: true }) });
  const { data: catsData }  = useQuery({ queryKey: ['categorias', { all: true }], queryFn: () => getCategorias({ all: true }) });
  const { data: paisesData } = useQuery({ queryKey: ['paises'], queryFn: getPaises });
  const { data: vendData } = useQuery({ queryKey: ['vendedores', { all: true }], queryFn: () => getVendedores({ all: true }) });
  const { data: condData } = useQuery({ queryKey: ['condiciones'], queryFn: getCondiciones });
  const { data: agenciasData } = useQuery({ queryKey: ['agencias', { all: true }], queryFn: () => getAgencias({ all: true }) });

  const zonas       = zonasData?.data ?? [];
  const cats        = catsData?.data ?? [];
  const paises      = Array.isArray(paisesData) ? paisesData : [];
  const vendedores  = vendData?.data ?? [];
  const condiciones = condData ?? [];
  const agencias    = agenciasData?.data ?? [];

  // Sync search text con agencia seleccionada
  useEffect(() => {
    if (form.cli_agencia) {
      const a = agencias.find((ag) => ag.agen_codigo === form.cli_agencia);
      if (a) setAgenSearch(a.agen_desc);
    } else {
      setAgenSearch('');
    }
  }, [form.cli_agencia, agencias]);

  const filteredAgencias = agencias.filter((a) =>
    !agenSearch || a.agen_desc.toLowerCase().includes(agenSearch.toLowerCase())
  );

  const condContado = ['CONTADO', 'CANJE'];
  const condCredito = ['30 DIAS', '60 DIAS', '90 DIAS', '120 DIAS', 'CANJE'];
  const condicionesFiltradas = form.cli_tipo_vta === 'C'
    ? condiciones.filter((c) => condContado.includes(c.con_desc))
    : form.cli_tipo_vta === 'R'
      ? condiciones.filter((c) => condCredito.includes(c.con_desc))
      : condiciones;

  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
  const sel   = `${input}`;

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      {/* Datos principales */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos principales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón social <span className="text-red-500">*</span></label>
            <input value={form.cli_nom} onChange={(e) => set({ cli_nom: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUC / C.I.</label>
            <input value={form.cli_ruc} onChange={(e) => set({ cli_ruc: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Persona de contacto</label>
            <input value={form.cli_pers_contacto} onChange={(e) => set({ cli_pers_contacto: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input value={form.cli_tel} onChange={(e) => set({ cli_tel: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
            <input value={form.cli_fax} onChange={(e) => set({ cli_fax: e.target.value })} className={input} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            {form.cli_emails.map((email, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const updated = [...form.cli_emails];
                    updated[idx] = e.target.value;
                    onChange({ ...form, cli_emails: updated });
                  }}
                  placeholder={idx === 0 ? 'Email principal' : `Email ${idx + 1}`}
                  className={`${input} flex-1`}
                />
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.cli_emails.filter((_, i) => i !== idx);
                      onChange({ ...form, cli_emails: updated });
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                    title="Quitar email"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            {form.cli_emails.length < 4 && (
              <button
                type="button"
                onClick={() => onChange({ ...form, cli_emails: [...form.cli_emails, ''] })}
                className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition"
              >
                <Plus size={14} /> Agregar email
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Dirección */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Dirección</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input value={form.cli_dir2} onChange={(e) => set({ cli_dir2: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
            <input value={form.cli_localidad} onChange={(e) => set({ cli_localidad: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <select value={form.cli_pais} onChange={(e) => set({ cli_pais: e.target.value ? Number(e.target.value) : '' })} className={sel}>
              <option value="">Sin especificar</option>
              {paises.map((p: any) => <option key={p.pais_codigo} value={p.pais_codigo}>{p.pais_desc}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Clasificación */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Clasificación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
            <select value={form.cli_zona} onChange={(e) => set({ cli_zona: e.target.value ? Number(e.target.value) : '' })} className={sel}>
              <option value="">Sin zona</option>
              {zonas.map((z) => <option key={z.zona_codigo} value={z.zona_codigo}>{z.zona_desc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select value={form.cli_categ} onChange={(e) => set({ cli_categ: e.target.value ? Number(e.target.value) : '' })} className={sel}>
              <option value="">Sin categoría</option>
              {cats.map((c) => <option key={c.fcat_codigo} value={c.fcat_codigo}>{c.fcat_desc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de venta</label>
            <select value={form.cli_tipo_vta} onChange={(e) => {
              const tipo = e.target.value as 'C' | 'R' | '';
              const patch: Partial<ClienteFormData> = { cli_tipo_vta: tipo };
              const allowed = tipo === 'C' ? condContado : tipo === 'R' ? condCredito : [];
              if (!allowed.includes(form.cli_cond_venta)) {
                const first = condiciones.find((c) => allowed.includes(c.con_desc));
                patch.cli_cond_venta = first?.con_desc ?? '';
              }
              set(patch);
            }} className={sel}>
              <option value="C">Contado</option>
              <option value="R">Crédito</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cond. de venta</label>
            <select value={form.cli_cond_venta} onChange={(e) => set({ cli_cond_venta: e.target.value })} disabled={!form.cli_tipo_vta} className={sel}>
              {condicionesFiltradas.map((c) => (
                <option key={c.con_desc} value={c.con_desc}>{c.con_desc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
            <select value={form.cli_vendedor} onChange={(e) => set({ cli_vendedor: e.target.value ? Number(e.target.value) : '' })} className={sel}>
              <option value="">Sin vendedor</option>
              {vendedores.map((v) => (
                <option key={v.vend_legajo} value={v.vend_legajo}>{v.oper_nombre} {v.oper_apellido}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad de venta</label>
            <select value={form.cli_mod_venta} onChange={(e) => {
              const mod = e.target.value as 'D' | 'I';
              const patch: Partial<ClienteFormData> = { cli_mod_venta: mod };
              if (mod === 'D') { patch.cli_agencia = ''; patch.cli_comision_agen = 0; }
              set(patch);
            }} className={sel}>
              <option value="D">Directa</option>
              <option value="I">Indirecta</option>
            </select>
          </div>
          {form.cli_mod_venta === 'I' && (
            <>
              <div ref={agenRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agencia</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    value={agenSearch}
                    onChange={(e) => { setAgenSearch(e.target.value); setAgenDropOpen(true); if (!e.target.value) set({ cli_agencia: '' }); }}
                    onFocus={() => setAgenDropOpen(true)}
                    placeholder="Buscar agencia..."
                    className={`${input} pl-9`}
                  />
                  {agenDropOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredAgencias.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                      ) : (
                        filteredAgencias.map((a) => {
                          const inactiva = a.agen_est === 'I';
                          return (
                            <button key={a.agen_codigo} type="button"
                              onClick={() => { if (!inactiva) { set({ cli_agencia: a.agen_codigo }); setAgenSearch(a.agen_desc); setAgenDropOpen(false); } }}
                              disabled={inactiva}
                              className={`w-full text-left px-3 py-2 text-sm ${inactiva ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'hover:bg-primary-50 hover:text-primary-700'}`}>
                              <span className={inactiva ? 'line-through' : 'font-medium'}>{a.agen_desc}</span>
                              {inactiva && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-400">Inactiva</span>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comisión agencia (%)</label>
                <input type="number" min="0" max="100" step="0.01" value={form.cli_comision_agen || ''}
                  onChange={(e) => set({ cli_comision_agen: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  className={input} />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.cli_est_cli} onChange={(e) => set({ cli_est_cli: e.target.value as 'A' | 'I' })} className={sel}>
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>
        </div>
      </section>

      {/* Crédito */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Crédito</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Límite de crédito</label>
            <input type="number" step="0.01" value={form.cli_imp_lim_cr} onChange={(e) => set({ cli_imp_lim_cr: Number(e.target.value) })} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Días máx. de atraso</label>
            <input type="number" value={form.cli_max_dias_atraso} onChange={(e) => set({ cli_max_dias_atraso: Number(e.target.value) })} className={input} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="bloq" checked={form.cli_bloq_lim_cr === 'S'} onChange={(e) => set({ cli_bloq_lim_cr: e.target.checked ? 'S' : 'N' })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="bloq" className="text-sm text-gray-700">Bloquear por límite de crédito</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="potencial" checked={form.cli_ind_potencial === 'S'} onChange={(e) => set({ cli_ind_potencial: e.target.checked ? 'S' : 'N' })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="potencial" className="text-sm text-gray-700">Cliente potencial</label>
          </div>
        </div>
      </section>

      {/* Observaciones */}
      <section>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
        <textarea rows={3} value={form.cli_obs} onChange={(e) => set({ cli_obs: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
      </section>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 border-t border-gray-100">
        <button onClick={onCancel} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button onClick={onSubmit} disabled={isPending} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition">
          {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </div>
  );
}
