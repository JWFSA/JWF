'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createOrdenTrabajo, getTiposOT } from '@/services/prd';
import { getMonedas } from '@/services/gen';
import { getClientes } from '@/services/fac';
import type { OrdenTrabajo } from '@/types/prd';
import { Search } from 'lucide-react';
import { useRef, useEffect } from 'react';

export default function NuevaOTPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<OrdenTrabajo>>({ ot_fec_emis: new Date().toISOString().split('T')[0], ot_mon: 1, ot_situacion: 1 });
  const [error, setError] = useState('');
  const [cliSearch, setCliSearch] = useState('');
  const [debouncedCli, setDebouncedCli] = useState('');
  const [cliOpen, setCliOpen] = useState(false);
  const cliRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setTimeout(() => setDebouncedCli(cliSearch), 400); return () => clearTimeout(t); }, [cliSearch]);
  useEffect(() => { const h = (e: MouseEvent) => { if (cliRef.current && !cliRef.current.contains(e.target as Node)) setCliOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

  const { data: tiposData } = useQuery({ queryKey: ['tipos-ot'], queryFn: getTiposOT });
  const { data: monedasData } = useQuery({ queryKey: ['monedas'], queryFn: getMonedas });
  const { data: cliData } = useQuery({ queryKey: ['cli-search-ot', debouncedCli], queryFn: () => getClientes({ search: debouncedCli, limit: 10 }), enabled: cliOpen && debouncedCli.length >= 2 });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: createOrdenTrabajo,
    onSuccess: (data) => router.push(`/prd/ordenes-trabajo/${data.ot_clave}`),
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Error al crear'),
  });

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Nueva orden de trabajo</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label><input type="date" value={form.ot_fec_emis ?? ''} onChange={(e) => set('ot_fec_emis', e.target.value)} required className={inp} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select value={form.ot_tipo ?? ''} onChange={(e) => set('ot_tipo', Number(e.target.value) || null)} className={inp}>
              <option value="">--</option>{(tiposData ?? []).map((t) => <option key={t.tipo_codigo} value={t.tipo_codigo}>{t.tipo_desc}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select value={form.ot_mon ?? 1} onChange={(e) => set('ot_mon', Number(e.target.value))} className={inp}>
              {(monedasData ?? []).map((m) => <option key={m.mon_codigo} value={m.mon_codigo}>{m.mon_desc}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2" ref={cliRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input value={cliSearch} onChange={(e) => { setCliSearch(e.target.value); setCliOpen(true); }} onFocus={() => setCliOpen(true)} placeholder="Buscar cliente..." className={`pl-9 ${inp}`} />
              {cliOpen && debouncedCli.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {(cliData?.data ?? []).map((c) => (
                    <button key={c.cli_codigo} type="button" onClick={() => { set('ot_cli', c.cli_codigo); set('ot_cli_nom', c.cli_nom); set('ot_cli_tel', c.cli_tel); setCliSearch(c.cli_nom); setCliOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50">{c.cli_nom}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label><input value={form.ot_contacto ?? ''} onChange={(e) => set('ot_contacto', e.target.value)} className={inp} /></div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Descripci{'\u00f3'}n</label><input value={form.ot_desc ?? ''} onChange={(e) => set('ot_desc', e.target.value)} className={inp} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Producto</label><input value={form.ot_nom_producto ?? ''} onChange={(e) => set('ot_nom_producto', e.target.value)} className={inp} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Fec. entrega</label><input type="date" value={form.ot_fec_ent ?? ''} onChange={(e) => set('ot_fec_ent', e.target.value || null)} className={inp} /></div>
          <div className="sm:col-span-2 md:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label><textarea value={form.ot_obs ?? ''} onChange={(e) => set('ot_obs', e.target.value)} rows={2} className={`${inp} resize-none`} /></div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex justify-end gap-3">
        <button onClick={() => router.back()} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        <button onClick={() => mut.mutate(form)} disabled={mut.isPending} className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">{mut.isPending ? 'Creando...' : 'Crear OT'}</button>
      </div>
    </div>
  );
}
