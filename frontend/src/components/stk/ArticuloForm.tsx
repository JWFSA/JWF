'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { createArticulo, updateArticulo, getLineas, getMarcas, getRubros, getGrupos, getUnidadesMedida, getClasificaciones } from '@/services/stk';
import { getPaises, getImpuestos } from '@/services/gen';
import { getProveedores } from '@/services/fin';
import type { Articulo } from '@/types/stk';
import { showSuccess } from '@/lib/swal';
import { Search } from 'lucide-react';

const optStr = z.string().optional().nullable();
const optNum = z.coerce.number().nullable().optional();

const schema = z.object({
  art_desc:              z.string().min(1, 'La descripción es requerida').max(100),
  art_desc_abrev:        z.string().max(20).optional().nullable(),
  art_codigo_fabrica:    z.string().max(20).optional().nullable(),
  art_cod_alfanumerico:  z.string().max(20).optional().nullable(),
  art_unid_med:          optStr,
  art_linea:             optStr,
  art_marca:             optStr,
  art_rubro:             optStr,
  art_grupo:             optStr,
  art_clasificacion:     optStr,
  art_est:               z.enum(['A', 'I']),
  art_impu:              optStr,
  art_ind_imp:           optStr,
  art_tipo_comision:     optStr,
  art_ind_venta:         optStr,
  art_factor_conversion: optNum,
  art_pais:              optStr,
  art_prov:              optStr,
  art_empaque:           optStr,
  art_contenido:         optNum,
  art_datos_tec:         optStr,
  art_color:             optStr,
  art_med_base:          optNum,
  art_med_alto:          optNum,
  art_med_total:         optNum,
  art_max_porc_dcto_vta: optNum,
  art_kg_unid:           optNum,
  art_porc_aum_costo:    optNum,
});

type FormData = z.infer<typeof schema>;

interface Props {
  articulo?: Articulo;
}

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

export default function ArticuloForm({ articulo }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!articulo;

  const { data: lineasData }  = useQuery({ queryKey: ['lineas', { all: true }],  queryFn: () => getLineas({ all: true }) });
  const { data: marcasData }  = useQuery({ queryKey: ['marcas', { all: true }],  queryFn: () => getMarcas({ all: true }) });
  const { data: rubrosData }  = useQuery({ queryKey: ['rubros', { all: true }],  queryFn: () => getRubros({ all: true }) });
  const { data: gruposData }  = useQuery({ queryKey: ['stk-grupos', { all: true }], queryFn: () => getGrupos({ all: true }) });
  const { data: umedData }    = useQuery({ queryKey: ['unidades-medida'],         queryFn: () => getUnidadesMedida({ all: true }) });
  const { data: clasData }    = useQuery({ queryKey: ['stk-clasificaciones', { all: true }], queryFn: () => getClasificaciones({ all: true }) });
  const { data: paisesData }  = useQuery({ queryKey: ['paises'], queryFn: getPaises });
  const [provSearch, setProvSearch] = useState(articulo?.prov_razon_social ?? '');
  const [debouncedProvSearch, setDebouncedProvSearch] = useState('');
  const [provDropOpen, setProvDropOpen] = useState(false);
  const provRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedProvSearch(provSearch), 300);
    return () => clearTimeout(t);
  }, [provSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (provRef.current && !provRef.current.contains(e.target as Node)) setProvDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: provData } = useQuery({
    queryKey: ['proveedores', { search: debouncedProvSearch, limit: 15 }],
    queryFn: () => getProveedores({ search: debouncedProvSearch, limit: 15 }),
    enabled: provSearch.length >= 2,
  });
  const { data: impData }     = useQuery({ queryKey: ['impuestos', { all: true }], queryFn: () => getImpuestos({ all: true }) });

  const lineas    = lineasData?.data  ?? [];
  const marcas    = marcasData?.data  ?? [];
  const rubros    = rubrosData?.data  ?? [];
  const grupos    = gruposData?.data  ?? [];
  const unidades  = umedData?.data    ?? [];
  const clasifs   = clasData?.data    ?? [];
  const paises    = Array.isArray(paisesData) ? paisesData : [];
  const proveedores = provData?.data  ?? [];
  const impuestos = impData?.data     ?? [];

  const toStr = (v: unknown) => v != null && v !== '' ? String(v) : '';
  const toNum = (v: unknown) => { const n = parseFloat(String(v)); return isFinite(n) ? n : null; };

  const getDefaults = (a?: Articulo): FormData => ({
    art_desc:              a?.art_desc ?? '',
    art_desc_abrev:        a?.art_desc_abrev ?? '',
    art_codigo_fabrica:    a?.art_codigo_fabrica ?? '',
    art_cod_alfanumerico:  a?.art_cod_alfanumerico ?? '',
    art_unid_med:          a?.art_unid_med ?? '',
    art_linea:             toStr(a?.art_linea),
    art_marca:             toStr(a?.art_marca),
    art_rubro:             toStr(a?.art_rubro),
    art_grupo:             toStr(a?.art_grupo),
    art_clasificacion:     toStr(a?.art_clasificacion),
    art_est:               a?.art_est ?? 'A',
    art_impu:              toStr(a?.art_impu),
    art_ind_imp:           a?.art_ind_imp ?? '',
    art_tipo_comision:     a?.art_tipo_comision ?? '',
    art_ind_venta:         a?.art_ind_venta ?? 'S',
    art_factor_conversion: toNum(a?.art_factor_conversion),
    art_pais:              toStr(a?.art_pais),
    art_prov:              toStr(a?.art_prov),
    art_empaque:           a?.art_empaque ?? '',
    art_contenido:         toNum(a?.art_contenido),
    art_datos_tec:         a?.art_datos_tec ?? '',
    art_color:             a?.art_color ?? '',
    art_med_base:          toNum(a?.art_med_base),
    art_med_alto:          toNum(a?.art_med_alto),
    art_med_total:         toNum(a?.art_med_total),
    art_max_porc_dcto_vta: toNum(a?.art_max_porc_dcto_vta),
    art_kg_unid:           toNum(a?.art_kg_unid),
    art_porc_aum_costo:    toNum(a?.art_porc_aum_costo),
  });

  const catalogsLoaded = !!(lineasData && marcasData && rubrosData && umedData && clasData && impData);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: getDefaults(articulo),
  });

  const hasReset = useRef(false);
  useEffect(() => {
    if (articulo && catalogsLoaded && !hasReset.current) {
      reset(getDefaults(articulo));
      setProvSearch(articulo.prov_razon_social ?? '');
      hasReset.current = true;
    }
  }, [articulo, catalogsLoaded]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data)) {
        clean[k] = v === '' ? null : v;
      }
      // Convertir FKs string a number
      for (const fk of ['art_linea','art_marca','art_rubro','art_grupo','art_clasificacion','art_impu','art_pais','art_prov']) {
        if (clean[fk]) clean[fk] = Number(clean[fk]);
      }
      return isEdit
        ? updateArticulo(articulo!.art_codigo, clean)
        : createArticulo(clean);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articulos'] });
      showSuccess(isEdit ? 'Artículo actualizado.' : 'Artículo creado.');
      if (!isEdit) router.push('/stk/articulos');
    },
  });

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          {isEdit ? `Editar artículo #${articulo!.art_codigo}` : 'Nuevo artículo'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isEdit ? articulo!.art_desc : 'Completá los datos del nuevo artículo'}
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">

        {/* Datos principales */}
        <Section title="Datos principales">
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <input {...register('art_desc')} className={input} placeholder="Descripción completa del artículo" />
            {errors.art_desc && <p className="text-red-500 text-xs mt-1">{errors.art_desc.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desc. abreviada</label>
            <input {...register('art_desc_abrev')} className={input} maxLength={20} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cód. fábrica</label>
            <input {...register('art_codigo_fabrica')} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cód. alfanumérico</label>
            <input {...register('art_cod_alfanumerico')} className={input} maxLength={20} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de medida</label>
            <select {...register('art_unid_med')} className={input}>
              <option value="">— Seleccione —</option>
              {unidades.map((u) => <option key={u.um_codigo} value={u.um_codigo}>{u.um_codigo}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select {...register('art_est')} className={input}>
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indicador de venta</label>
            <select {...register('art_ind_venta')} className={input}>
              <option value="S">Sí</option>
              <option value="N">No</option>
            </select>
          </div>
        </Section>

        {/* Clasificación */}
        <Section title="Clasificación">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Línea</label>
            <select {...register('art_linea')} className={input}>
              <option value="">— Seleccione —</option>
              {lineas.map((l) => <option key={l.lin_codigo} value={String(l.lin_codigo)}>{l.lin_desc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <select {...register('art_marca')} className={input}>
              <option value="">— Seleccione —</option>
              {marcas.map((m) => <option key={m.marc_codigo} value={String(m.marc_codigo)}>{m.marc_desc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rubro</label>
            <select {...register('art_rubro')} className={input}>
              <option value="">— Seleccione —</option>
              {rubros.map((r) => <option key={r.rub_codigo} value={String(r.rub_codigo)}>{r.rub_desc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
            <select {...register('art_grupo')} className={input}>
              <option value="">— Seleccione —</option>
              {grupos.map((g: any) => <option key={`${g.grup_codigo}-${g.grup_linea}`} value={String(g.grup_codigo)}>{g.grup_desc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación</label>
            <select {...register('art_clasificacion')} className={input}>
              <option value="">— Seleccione —</option>
              {clasifs.map((c: any) => <option key={c.clas_codigo} value={String(c.clas_codigo)}>{c.clas_desc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País de origen</label>
            <select {...register('art_pais')} className={input}>
              <option value="">— Seleccione —</option>
              {paises.map((p: any) => <option key={p.pais_codigo} value={String(p.pais_codigo)}>{p.pais_desc}</option>)}
            </select>
          </div>
          <div ref={provRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={provSearch}
                onChange={(e) => { setProvSearch(e.target.value); setProvDropOpen(true); if (!e.target.value) setValue('art_prov', null as any); }}
                onFocus={() => { if (provSearch.length >= 2) setProvDropOpen(true); }}
                placeholder="Buscar proveedor..."
                className={`${input} pl-9`}
              />
              {provDropOpen && provSearch.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {proveedores.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                  ) : (
                    proveedores.map((p: any) => (
                      <button key={p.prov_codigo} type="button"
                        onClick={() => { setValue('art_prov', String(p.prov_codigo)); setProvSearch(p.prov_razon_social); setProvDropOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700">
                        <span className="font-medium">{p.prov_razon_social}</span>
                        {p.prov_ruc && <span className="text-gray-400 ml-2 text-xs">{p.prov_ruc}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Impuestos y comisiones */}
        <Section title="Impuestos y comisiones">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Impuesto</label>
            <select {...register('art_impu')} className={input}>
              <option value="">— Seleccione —</option>
              {impuestos.map((i: any) => <option key={i.impu_codigo} value={String(i.impu_codigo)}>{i.impu_desc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indicador impuesto</label>
            <select {...register('art_ind_imp')} className={input}>
              <option value="">— Seleccione —</option>
              <option value="S">Gravado</option>
              <option value="N">Exento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de comisión</label>
            <select {...register('art_tipo_comision')} className={input}>
              <option value="">— Seleccione —</option>
              <option value="A">Por artículo</option>
              <option value="P">Porcentaje</option>
              <option value="N">Sin comisión</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% máx. descuento venta</label>
            <input type="number" min="0" max="100" step="0.01" {...register('art_max_porc_dcto_vta')} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% aumento costo</label>
            <input type="number" min="0" step="0.01" {...register('art_porc_aum_costo')} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Factor de conversión</label>
            <input type="number" min="0" step="0.01" {...register('art_factor_conversion')} className={input} />
          </div>
        </Section>

        {/* Medidas y empaque */}
        <Section title="Medidas y empaque">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medida base</label>
            <input type="number" min="0" step="0.01" {...register('art_med_base')} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medida alto</label>
            <input type="number" min="0" step="0.01" {...register('art_med_alto')} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medida total (m²)</label>
            <input type="number" min="0" step="0.01" {...register('art_med_total')} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empaque</label>
            <input {...register('art_empaque')} className={input} maxLength={40} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <input type="number" min="0" step="0.01" {...register('art_contenido')} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kg por unidad</label>
            <input type="number" min="0" step="0.01" {...register('art_kg_unid')} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input {...register('art_color')} className={input} maxLength={20} />
          </div>
        </Section>

        {/* Datos técnicos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Datos técnicos</label>
          <textarea {...register('art_datos_tec')} rows={3} className={`${input} resize-none`} placeholder="Información técnica adicional..." />
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {(mutation.error as any)?.response?.data?.message ?? 'Error al guardar'}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Link href="/stk/articulos" className="w-full sm:w-auto text-center px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Cancelar
          </Link>
          <button type="submit" disabled={mutation.isPending}
            className="w-full sm:w-auto px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50">
            {mutation.isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear artículo'}
          </button>
        </div>
      </form>
    </div>
  );
}
