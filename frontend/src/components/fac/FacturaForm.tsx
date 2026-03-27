'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getClientes, getArticulos } from '@/services/fac';
import type { Factura, FacturaDet, Articulo, Cliente } from '@/types/fac';
import { Search, Plus, Trash2 } from 'lucide-react';
import { toInputDate } from '@/lib/utils';

interface Props {
  initial?: Partial<Factura>;
  onSave: (data: Partial<Factura>) => Promise<void>;
  isPending: boolean;
  error?: string;
}

const IVA_OPTS = [
  { v: 1, l: 'Exento' },
  { v: 2, l: 'IVA 10%' },
  { v: 3, l: 'IVA 5%' },
];

function calcLine(precio: number, cant: number, porcDto: number, codIva: number): { neto: number; iva: number } {
  const bruto = precio * cant;
  const dto = bruto * (porcDto / 100);
  const total = bruto - dto;
  if (codIva === 2) {
    const neto = total / 1.1;
    return { neto: Math.round(neto), iva: Math.round(neto * 0.1) };
  }
  if (codIva === 3) {
    const neto = total / 1.05;
    return { neto: Math.round(neto), iva: Math.round(neto * 0.05) };
  }
  return { neto: Math.round(total), iva: 0 };
}

const empty: Partial<Factura> = {
  doc_fec_doc: new Date().toISOString().split('T')[0],
  doc_cli: undefined,
  doc_cli_nom: '',
  doc_cli_ruc: '',
  doc_nro_timbrado: '',
  doc_serie: '',
  doc_cond_vta: null,
  doc_mon: 1,
  doc_obs: '',
  items: [],
};

const fmt = (n: number) => Number(n).toLocaleString('es-PY');

export default function FacturaForm({ initial, onSave, isPending, error }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Factura>>({
    ...empty,
    ...initial,
    doc_fec_doc: initial?.doc_fec_doc ? toInputDate(initial.doc_fec_doc) : empty.doc_fec_doc,
  });
  const [items, setItems] = useState<FacturaDet[]>(initial?.items ?? []);

  // Cliente search
  const [cliSearch, setCliSearch] = useState(initial?.cli_nom ?? initial?.doc_cli_nom ?? '');
  const [debouncedCliSearch, setDebouncedCliSearch] = useState('');
  const [cliDropOpen, setCliDropOpen] = useState(false);
  const cliRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCliSearch(cliSearch), 400);
    return () => clearTimeout(t);
  }, [cliSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cliRef.current && !cliRef.current.contains(e.target as Node)) setCliDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Artículo search
  const [artSearch, setArtSearch] = useState('');
  const [debouncedArtSearch, setDebouncedArtSearch] = useState('');
  const [artDropOpen, setArtDropOpen] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedArtSearch(artSearch), 400);
    return () => clearTimeout(t);
  }, [artSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (artRef.current && !artRef.current.contains(e.target as Node)) setArtDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: cliData } = useQuery({
    queryKey: ['clientes-search', debouncedCliSearch],
    queryFn: () => getClientes({ search: debouncedCliSearch, limit: 10 }),
    enabled: cliDropOpen && debouncedCliSearch.length >= 2,
  });

  const { data: artData } = useQuery({
    queryKey: ['articulos-search', debouncedArtSearch],
    queryFn: () => getArticulos({ search: debouncedArtSearch, limit: 10 }),
    enabled: artDropOpen && debouncedArtSearch.length >= 2,
  });

  const set = (k: keyof Factura, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const addArticulo = (art: Articulo) => {
    const { neto, iva } = calcLine(0, 1, 0, 2);
    setItems((prev) => [
      ...prev,
      {
        det_nro_item: prev.length + 1,
        det_art: art.art_codigo,
        det_art_desc: art.art_desc,
        det_cant: 1,
        det_um_fac: art.art_unid_med ?? '',
        det_precio_mon: 0,
        det_porc_dto: 0,
        det_neto_loc: neto,
        det_iva_loc: iva,
        det_cod_iva: 2,
      },
    ]);
    setArtSearch('');
    setArtDropOpen(false);
  };

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof FacturaDet, value: unknown) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const updated = { ...it, [field]: value };
        // Recalcular neto/iva si cambia precio, cant, dto o cod_iva
        if (['det_precio_mon', 'det_cant', 'det_porc_dto', 'det_cod_iva'].includes(field as string)) {
          const { neto, iva } = calcLine(
            Number(field === 'det_precio_mon' ? value : updated.det_precio_mon),
            Number(field === 'det_cant' ? value : updated.det_cant),
            Number(field === 'det_porc_dto' ? value : updated.det_porc_dto),
            Number(field === 'det_cod_iva' ? value : updated.det_cod_iva),
          );
          return { ...updated, det_neto_loc: neto, det_iva_loc: iva };
        }
        return updated;
      })
    );
  };

  // Totales
  const totales = useMemo(() => {
    let grav10 = 0, grav5 = 0, exen = 0, iva10 = 0, iva5 = 0;
    for (const it of items) {
      if (it.det_cod_iva === 2) { grav10 += it.det_neto_loc; iva10 += it.det_iva_loc; }
      else if (it.det_cod_iva === 3) { grav5 += it.det_neto_loc; iva5 += it.det_iva_loc; }
      else { exen += it.det_neto_loc; }
    }
    const total = grav10 + grav5 + exen + iva10 + iva5;
    return { grav10, grav5, exen, iva10, iva5, total };
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...form,
      items,
      doc_grav_10_loc: totales.grav10,
      doc_grav_5_loc: totales.grav5,
      doc_neto_exen_loc: totales.exen,
      doc_iva_10_loc: totales.iva10,
      doc_iva_5_loc: totales.iva5,
      doc_saldo_loc: totales.total,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Datos de la factura</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.doc_fec_doc ?? ''}
              onChange={(e) => set('doc_fec_doc', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Timbrado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nro. Timbrado</label>
            <input
              value={form.doc_nro_timbrado ?? ''}
              onChange={(e) => set('doc_nro_timbrado', e.target.value)}
              placeholder="Ej: 17321756"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Serie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serie</label>
            <input
              value={form.doc_serie ?? ''}
              onChange={(e) => set('doc_serie', e.target.value)}
              placeholder="Ej: 001"
              maxLength={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Cliente (búsqueda) */}
          <div className="sm:col-span-2" ref={cliRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={cliSearch}
                onChange={(e) => { setCliSearch(e.target.value); setCliDropOpen(true); if (!e.target.value) { set('doc_cli', undefined); set('doc_cli_ruc', ''); } }}
                onFocus={() => setCliDropOpen(true)}
                placeholder="Buscar cliente..."
                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {cliDropOpen && cliSearch.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {(cliData?.data ?? []).length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                  ) : (
                    (cliData?.data ?? []).map((c) => (
                      <button key={c.cli_codigo} type="button"
                        onClick={() => {
                          set('doc_cli', c.cli_codigo);
                          set('doc_cli_ruc', c.cli_ruc ?? '');
                          setCliSearch(c.cli_nom);
                          setCliDropOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-700">
                        <span className="font-medium">{c.cli_nom}</span>
                        {c.cli_ruc && <span className="text-gray-400 ml-2 text-xs">RUC: {c.cli_ruc}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RUC cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUC cliente</label>
            <input
              value={form.doc_cli_ruc ?? ''}
              onChange={(e) => set('doc_cli_ruc', e.target.value)}
              placeholder="RUC"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Nombre en factura */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en factura</label>
            <input
              value={form.doc_cli_nom ?? ''}
              onChange={(e) => set('doc_cli_nom', e.target.value)}
              placeholder="Nombre a imprimir (opcional si difiere del cliente)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Observaciones */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <input
              value={form.doc_obs ?? ''}
              onChange={(e) => set('doc_obs', e.target.value)}
              placeholder="Notas adicionales..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Artículos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Artículos / Servicios</h2>

        <div className="mb-4" ref={artRef}>
          <div className="relative">
            <Plus size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={artSearch}
              onChange={(e) => { setArtSearch(e.target.value); setArtDropOpen(true); }}
              onFocus={() => setArtDropOpen(true)}
              placeholder="Buscar artículo para agregar..."
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
                      {a.art_unid_med && <span className="text-gray-400 ml-2 text-xs">{a.art_unid_med}</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left pb-2 pr-2">Descripción</th>
                  <th className="text-left pb-2 pr-2 w-16">UM</th>
                  <th className="text-right pb-2 pr-2 w-20">Cant.</th>
                  <th className="text-right pb-2 pr-2 w-28">Precio c/IVA</th>
                  <th className="text-right pb-2 pr-2 w-16">% Dto</th>
                  <th className="text-left pb-2 pr-2 w-24">IVA</th>
                  <th className="text-right pb-2 pr-2 w-28">Neto</th>
                  <th className="w-8 pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="py-1.5 pr-2">
                      <input
                        value={it.det_art_desc}
                        onChange={(e) => updateItem(idx, 'det_art_desc', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        value={it.det_um_fac}
                        onChange={(e) => updateItem(idx, 'det_um_fac', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number" min="0.001" step="0.001"
                        value={it.det_cant}
                        onChange={(e) => updateItem(idx, 'det_cant', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number" min="0" step="1"
                        value={it.det_precio_mon}
                        onChange={(e) => updateItem(idx, 'det_precio_mon', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number" min="0" max="100" step="0.01"
                        value={it.det_porc_dto}
                        onChange={(e) => updateItem(idx, 'det_porc_dto', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <select
                        value={it.det_cod_iva}
                        onChange={(e) => updateItem(idx, 'det_cod_iva', Number(e.target.value))}
                        className="w-full border border-gray-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
                      >
                        {IVA_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </td>
                    <td className="py-1.5 pr-2 text-xs text-right font-mono text-gray-700">{fmt(it.det_neto_loc)}</td>
                    <td className="py-1.5">
                      <button type="button" onClick={() => removeItem(idx)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No hay artículos. Busca arriba para agregar.</p>
        )}
      </div>

      {/* Totales */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Totales</h2>
          <div className="flex flex-col items-end gap-1 text-sm">
            {totales.exen > 0 && (
              <div className="flex gap-8 text-gray-600">
                <span>Exentas</span>
                <span className="font-mono w-32 text-right">{fmt(totales.exen)}</span>
              </div>
            )}
            {totales.grav5 > 0 && (
              <div className="flex gap-8 text-gray-600">
                <span>Gravadas 5%</span>
                <span className="font-mono w-32 text-right">{fmt(totales.grav5)}</span>
              </div>
            )}
            {totales.grav10 > 0 && (
              <div className="flex gap-8 text-gray-600">
                <span>Gravadas 10%</span>
                <span className="font-mono w-32 text-right">{fmt(totales.grav10)}</span>
              </div>
            )}
            {totales.iva5 > 0 && (
              <div className="flex gap-8 text-gray-600">
                <span>IVA 5%</span>
                <span className="font-mono w-32 text-right">{fmt(totales.iva5)}</span>
              </div>
            )}
            {totales.iva10 > 0 && (
              <div className="flex gap-8 text-gray-600">
                <span>IVA 10%</span>
                <span className="font-mono w-32 text-right">{fmt(totales.iva10)}</span>
              </div>
            )}
            <div className="flex gap-8 font-semibold text-gray-800 border-t border-gray-200 pt-2 mt-1">
              <span>Total</span>
              <span className="font-mono w-32 text-right">{fmt(totales.total)}</span>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition">
          {isPending ? 'Guardando…' : 'Guardar factura'}
        </button>
      </div>
    </form>
  );
}
