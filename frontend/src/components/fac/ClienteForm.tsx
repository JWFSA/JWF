'use client';

import { useQuery } from '@tanstack/react-query';
import { getZonas, getCategorias, getVendedores, getCondiciones } from '@/services/fac';
import { getPaises } from '@/services/gen';
import { Plus, X } from 'lucide-react';

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

  const { data: zonasData } = useQuery({ queryKey: ['zonas', { all: true }], queryFn: () => getZonas({ all: true }) });
  const { data: catsData }  = useQuery({ queryKey: ['categorias', { all: true }], queryFn: () => getCategorias({ all: true }) });
  const { data: paisesData } = useQuery({ queryKey: ['paises'], queryFn: getPaises });
  const { data: vendData } = useQuery({ queryKey: ['vendedores', { all: true }], queryFn: () => getVendedores({ all: true }) });
  const { data: condData } = useQuery({ queryKey: ['condiciones'], queryFn: getCondiciones });

  const zonas       = zonasData?.data ?? [];
  const cats        = catsData?.data ?? [];
  const paises      = Array.isArray(paisesData) ? paisesData : [];
  const vendedores  = vendData?.data ?? [];
  const condiciones = condData ?? [];

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad de venta</label>
            <select value={form.cli_mod_venta} onChange={(e) => set({ cli_mod_venta: e.target.value as 'D' | 'I' })} className={sel}>
              <option value="D">Directa</option>
              <option value="I">Indirecta</option>
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
