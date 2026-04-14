'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFacturasPendientes, getCuotasFactura, registrarCobro } from '@/services/fin';
import { formatDate } from '@/lib/utils';
import type { FacturaPendiente, Cuota } from '@/types/fin';
import SearchField from '@/components/ui/SearchField';
import TablePagination from '@/components/ui/TablePagination';
import ExportButton from '@/components/ui/ExportButton';
import { DollarSign, ChevronDown, ChevronUp, X } from 'lucide-react';

const fmt = (n?: number | null) => n != null ? Number(n).toLocaleString('es-PY') : '—';

export default function CobranzasPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Cobro inline state
  const [cobrando, setCobrando] = useState<FacturaPendiente | null>(null);
  const [importe, setImporte] = useState('');
  const [fecPago, setFecPago] = useState(new Date().toISOString().split('T')[0]);
  const [cobroError, setCobroError] = useState('');
  const [cobroOk, setCobroOk] = useState('');

  // Cuotas expandidas
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['facturas-pendientes', { page, limit, search: debouncedSearch }],
    queryFn: () => getFacturasPendientes({ page, limit, search: debouncedSearch }),
  });

  const { data: cuotas } = useQuery({
    queryKey: ['cuotas', expandedDoc],
    queryFn: () => getCuotasFactura(expandedDoc!),
    enabled: expandedDoc != null,
  });

  const cobrarMut = useMutation({
    mutationFn: registrarCobro,
    onSuccess: (r) => {
      setCobroOk(`Cobro registrado. Saldo anterior: ${fmt(r.saldo_anterior)} → Nuevo saldo: ${fmt(r.saldo_nuevo)}`);
      setCobrando(null);
      setImporte('');
      setCobroError('');
      qc.invalidateQueries({ queryKey: ['facturas-pendientes'] });
      qc.invalidateQueries({ queryKey: ['cuotas'] });
      setTimeout(() => setCobroOk(''), 5000);
    },
    onError: (e: any) => setCobroError(e?.response?.data?.message ?? 'Error al registrar cobro'),
  });

  const facturas = data?.data ?? [];
  const pagination = data?.pagination;

  const openCobro = (f: FacturaPendiente) => {
    setCobrando(f);
    setImporte(String(Math.round(Number(f.doc_saldo_loc))));
    setFecPago(new Date().toISOString().split('T')[0]);
    setCobroError('');
  };

  const handleCobrar = () => {
    if (!cobrando) return;
    cobrarMut.mutate({ doc_clave: cobrando.doc_clave, importe: Number(importe), fec_pago: fecPago });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Cobranzas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Facturas pendientes de cobro</p>
        </div>
        <ExportButton filename="pendientes" fetchData={() => getFacturasPendientes({ all: true })} columns={[
          { header: 'Nro.', value: (r) => r.doc_nro_doc },
          { header: 'Fecha', value: (r) => r.doc_fec_doc },
          { header: 'Cliente', value: (r) => r.cli_nom },
          { header: 'Total', value: (r) => r.doc_total_loc },
          { header: 'Saldo', value: (r) => r.doc_saldo_loc },
        ]} />
      </div>

      {cobroOk && (
        <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{cobroOk}</div>
      )}

      {/* Modal de cobro */}
      {cobrando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Registrar cobro</h2>
              <button onClick={() => setCobrando(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-500">Factura #{cobrando.doc_nro_doc}</div>
                <div className="font-medium text-gray-800">{cobrando.cli_nom}</div>
                <div className="mt-1 flex justify-between">
                  <span className="text-gray-500">Saldo pendiente:</span>
                  <span className="font-bold text-gray-900">{fmt(cobrando.doc_saldo_loc)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago</label>
                <input type="date" value={fecPago} onChange={(e) => setFecPago(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importe a cobrar</label>
                <input type="number" min="1" max={Number(cobrando.doc_saldo_loc)} step="1"
                  value={importe} onChange={(e) => setImporte(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus />
              </div>

              {cobroError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{cobroError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setCobrando(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button onClick={handleCobrar} disabled={cobrarMut.isPending || !importe || Number(importe) <= 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition">
                  {cobrarMut.isPending ? 'Registrando…' : 'Registrar cobro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por cliente o nro. de factura..." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 w-28">Nro.</th>
                <th className="px-4 py-3 w-28">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3 text-right w-32">Total</th>
                <th className="px-4 py-3 text-right w-32">Saldo</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : facturas.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Sin facturas pendientes</td></tr>
              ) : (
                facturas.map((f) => (
                  <>
                    <tr key={f.doc_clave} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <button onClick={() => setExpandedDoc(expandedDoc === f.doc_clave ? null : f.doc_clave)}
                          className="text-gray-400 hover:text-gray-600 transition">
                          {expandedDoc === f.doc_clave ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{f.doc_nro_doc}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(f.doc_fec_doc)}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{f.cli_nom ?? '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-500">{fmt(f.doc_total_loc)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-red-600">{fmt(f.doc_saldo_loc)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openCobro(f)} title="Registrar cobro"
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
                          <DollarSign size={16} />
                        </button>
                      </td>
                    </tr>
                    {expandedDoc === f.doc_clave && cuotas && cuotas.length > 0 && (
                      <tr key={`${f.doc_clave}-cuotas`}>
                        <td colSpan={7} className="px-8 py-2 bg-gray-50">
                          <div className="text-xs font-medium text-gray-500 mb-1 uppercase">Cuotas</div>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-400">
                                <th className="text-left py-1">Vencimiento</th>
                                <th className="text-right py-1">Importe</th>
                                <th className="text-right py-1">Saldo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(cuotas as Cuota[]).map((c, i) => (
                                <tr key={i} className="border-t border-gray-100">
                                  <td className="py-1 text-gray-600">{formatDate(c.cuo_fec_vto)}</td>
                                  <td className="py-1 text-right tabular-nums text-gray-500">{fmt(c.cuo_imp_loc)}</td>
                                  <td className={`py-1 text-right tabular-nums font-medium ${Number(c.cuo_saldo_loc) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {fmt(c.cuo_saldo_loc)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <TablePagination
            total={pagination.total} page={page} limit={limit} totalPages={pagination.totalPages}
            onPageChange={setPage} onLimitChange={(n) => { setLimit(n); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
}
