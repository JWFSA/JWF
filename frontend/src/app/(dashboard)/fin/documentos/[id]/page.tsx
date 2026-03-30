'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getDocumentoFin } from '@/services/fin';
import { formatDate } from '@/lib/utils';

const fmt = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('es-PY').format(Number(n));

export default function DocumentoDetallePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: doc, isLoading } = useQuery({
    queryKey: ['fin-documentos', id],
    queryFn: () => getDocumentoFin(Number(id)),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando...</div>;
  if (!doc)      return <div className="p-6 text-sm text-red-500">Documento no encontrado</div>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Documento financiero</h1>
          <p className="text-sm text-gray-500 mt-0.5">{doc.tmov_desc ?? 'Doc'} Nro. {doc.doc_nro_doc}</p>
        </div>
        <button onClick={() => router.push('/fin/documentos')}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
          Volver
        </button>
      </div>

      {/* Cabecera */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos generales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Tipo:</span> <span className="ml-1 font-medium">{doc.tmov_desc ?? '—'}</span></div>
          <div><span className="text-gray-500">Nro. documento:</span> <span className="ml-1 font-mono">{doc.doc_nro_doc}</span></div>
          <div><span className="text-gray-500">Fecha documento:</span> <span className="ml-1">{formatDate(doc.doc_fec_doc)}</span></div>
          <div><span className="text-gray-500">Fecha operación:</span> <span className="ml-1">{formatDate(doc.doc_fec_oper)}</span></div>
          <div><span className="text-gray-500">Proveedor:</span> <span className="ml-1 font-medium">{doc.prov_nom ?? '—'}</span></div>
          <div><span className="text-gray-500">Cliente:</span> <span className="ml-1">{doc.doc_cli_nom ?? '—'}</span></div>
          <div><span className="text-gray-500">Moneda:</span> <span className="ml-1">{doc.mon_desc ?? '—'}</span></div>
          <div><span className="text-gray-500">Tipo saldo:</span> <span className="ml-1">{doc.doc_tipo_saldo === 'D' ? 'Débito' : doc.doc_tipo_saldo === 'C' ? 'Crédito' : '—'}</span></div>
          <div><span className="text-gray-500">Timbrado:</span> <span className="ml-1 font-mono">{doc.doc_nro_timbrado ?? '—'}</span></div>
          <div><span className="text-gray-500">Exenta:</span> <span className="ml-1 tabular-nums">{fmt(doc.doc_neto_exen_mon)}</span></div>
          <div><span className="text-gray-500">Gravada:</span> <span className="ml-1 tabular-nums">{fmt(doc.doc_neto_grav_mon)}</span></div>
          <div><span className="text-gray-500">IVA:</span> <span className="ml-1 tabular-nums">{fmt(doc.doc_iva_mon)}</span></div>
          <div className="sm:col-span-2 md:col-span-1"><span className="text-gray-500 font-semibold">Saldo:</span> <span className="ml-1 tabular-nums font-semibold">{fmt(doc.doc_saldo_mon)}</span></div>
          {doc.doc_obs && <div className="sm:col-span-2 md:col-span-3"><span className="text-gray-500">Obs:</span> <span className="ml-1">{doc.doc_obs}</span></div>}
        </div>
      </div>

      {/* Conceptos */}
      {doc.conceptos && doc.conceptos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Conceptos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2 px-2">Concepto</th>
                  <th className="py-2 px-2 w-12">D/C</th>
                  <th className="py-2 px-2 w-28 text-right">Exenta</th>
                  <th className="py-2 px-2 w-28 text-right">Gravada</th>
                  <th className="py-2 px-2 w-28 text-right">IVA</th>
                </tr>
              </thead>
              <tbody>
                {doc.conceptos.map((c) => (
                  <tr key={c.dcon_item} className="border-b border-gray-100">
                    <td className="py-2 px-2 text-xs text-gray-400">{c.dcon_item}</td>
                    <td className="py-2 px-2 text-gray-800">{c.concepto_desc ?? '—'}</td>
                    <td className="py-2 px-2 text-xs text-center text-gray-500">{c.dcon_tipo_saldo}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-600">{fmt(c.dcon_exen_mon)}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-600">{fmt(c.dcon_grav_mon)}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-600">{fmt(c.dcon_iva_mon)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cuotas */}
      {doc.cuotas && doc.cuotas.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Cuotas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-2 px-2 w-28">Vencimiento</th>
                  <th className="py-2 px-2 w-28 text-right">Importe</th>
                  <th className="py-2 px-2 w-28 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {doc.cuotas.map((c, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 px-2 text-xs text-gray-600">{formatDate(c.cuo_fec_vto)}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-600">{fmt(c.cuo_imp_mon)}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-gray-700 font-medium">{fmt(c.cuo_saldo_mon)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
