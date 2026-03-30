'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEjercicios, getCuentas } from '@/services/cnt';
import type { Asiento, AsientoDet, Cuenta } from '@/types/cnt';
import { Plus, Trash2 } from 'lucide-react';
import { toInputDate } from '@/lib/utils';

interface Props {
  initialData?: Asiento;
  isPending: boolean;
  error: string;
  onSubmit: (data: Partial<Asiento>) => void;
  onCancel: () => void;
}

const emptyLine = (): AsientoDet => ({
  asid_clave_ctaco: null,
  asid_ind_db_cr: 'D',
  asid_importe: 0,
  asid_tipo_mov: null,
  asid_nro_doc: null,
  asid_desc: null,
  asid_concepto: null,
  asid_ccosto: null,
});

const fmt = (n: number | null | undefined) =>
  n == null ? '' : new Intl.NumberFormat('es-PY').format(Number(n));

export default function AsientoForm({ initialData, isPending, error, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    asi_fec:       initialData?.asi_fec       ? toInputDate(initialData.asi_fec) : new Date().toISOString().split('T')[0],
    asi_ejercicio: initialData?.asi_ejercicio?.toString() ?? '',
    asi_obs:       initialData?.asi_obs ?? '',
  });
  const [detalle, setDetalle] = useState<AsientoDet[]>(
    initialData?.detalle?.length ? initialData.detalle : [emptyLine(), emptyLine()]
  );
  const [localError, setLocalError] = useState('');

  const { data: ejData } = useQuery({ queryKey: ['cnt-ejercicios', { all: true }], queryFn: () => getEjercicios({ all: true }) });
  const { data: ctaData } = useQuery({ queryKey: ['cnt-cuentas-imp', { all: true }], queryFn: () => getCuentas({ all: true }) });

  const ejercicios = ejData?.data ?? [];
  const cuentas    = (ctaData?.data ?? []).filter((c: Cuenta) => c.ctac_ind_imputable === 'S');

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const updateLine = (idx: number, field: keyof AsientoDet, value: string | number | null) => {
    setDetalle((prev) => { const u = [...prev]; u[idx] = { ...u[idx], [field]: value }; return u; });
  };
  const addLine = () => setDetalle((prev) => [...prev, emptyLine()]);
  const removeLine = (idx: number) => setDetalle((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const totalDebe  = detalle.filter((d) => d.asid_ind_db_cr === 'D').reduce((s, d) => s + (Number(d.asid_importe) || 0), 0);
  const totalHaber = detalle.filter((d) => d.asid_ind_db_cr === 'C').reduce((s, d) => s + (Number(d.asid_importe) || 0), 0);
  const balanced   = Math.abs(totalDebe - totalHaber) < 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.asi_fec || !form.asi_ejercicio) { setLocalError('La fecha y ejercicio son requeridos'); return; }
    if (!balanced) { setLocalError('El asiento no está balanceado (Debe ≠ Haber)'); return; }
    setLocalError('');
    onSubmit({
      asi_fec:       form.asi_fec,
      asi_ejercicio: Number(form.asi_ejercicio),
      asi_obs:       form.asi_obs || null,
      detalle:       detalle.filter((d) => d.asid_clave_ctaco && d.asid_importe),
    });
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos del asiento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
            <input type="date" value={form.asi_fec} onChange={(e) => set('asi_fec', e.target.value)}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ejercicio <span className="text-red-500">*</span></label>
            <select value={form.asi_ejercicio} onChange={(e) => set('asi_ejercicio', e.target.value)}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">— Seleccionar —</option>
              {ejercicios.map((ej) => <option key={ej.ej_codigo} value={ej.ej_codigo}>Ej. {ej.ej_codigo} ({ej.ej_fec_inicial?.substring(0,4)})</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <input value={form.asi_obs} onChange={(e) => set('asi_obs', e.target.value)} placeholder="Descripción del asiento"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Detalle del asiento</h2>
          <button type="button" onClick={addLine}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
            <Plus size={16} /> Agregar línea
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                <th className="py-2 px-2 w-8">#</th>
                <th className="py-2 px-2">Cuenta</th>
                <th className="py-2 px-2 w-24">D/H</th>
                <th className="py-2 px-2 w-32 text-right">Importe</th>
                <th className="py-2 px-2">Descripción</th>
                <th className="py-2 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((d, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 px-2 text-xs text-gray-400">{idx + 1}</td>
                  <td className="py-2 px-2">
                    <select value={d.asid_clave_ctaco ?? ''} onChange={(e) => updateLine(idx, 'asid_clave_ctaco', e.target.value ? Number(e.target.value) : null)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="">— Seleccionar cuenta —</option>
                      {cuentas.map((c: Cuenta) => <option key={c.ctac_clave} value={c.ctac_clave}>{c.ctac_nro} - {c.ctac_desc}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <select value={d.asid_ind_db_cr} onChange={(e) => updateLine(idx, 'asid_ind_db_cr', e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="D">Debe</option>
                      <option value="C">Haber</option>
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <input type="number" min="0" step="0.01" value={d.asid_importe || ''} onChange={(e) => updateLine(idx, 'asid_importe', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2">
                    <input value={d.asid_desc ?? ''} onChange={(e) => updateLine(idx, 'asid_desc', e.target.value)}
                      placeholder="Detalle"
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
                  </td>
                  <td className="py-2 px-2">
                    <button type="button" onClick={() => removeLine(idx)}
                      className="text-gray-400 hover:text-red-500 transition" title="Eliminar">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={2} className="py-3 px-2"></td>
                <td className="py-3 px-2 text-right font-semibold text-gray-700 text-xs">DEBE</td>
                <td className="py-3 px-2 text-right font-semibold tabular-nums text-gray-900">{fmt(totalDebe)}</td>
                <td colSpan={2}></td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td className="py-1 px-2 text-right font-semibold text-gray-700 text-xs">HABER</td>
                <td className="py-1 px-2 text-right font-semibold tabular-nums text-gray-900">{fmt(totalHaber)}</td>
                <td colSpan={2}></td>
              </tr>
              {!balanced && (
                <tr>
                  <td colSpan={2}></td>
                  <td className="py-1 px-2 text-right text-xs text-red-500 font-medium">DIF.</td>
                  <td className="py-1 px-2 text-right tabular-nums text-red-500 font-medium">{fmt(Math.abs(totalDebe - totalHaber))}</td>
                  <td colSpan={2}></td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>

      {displayError && <p className="text-sm text-red-600">{displayError}</p>}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
