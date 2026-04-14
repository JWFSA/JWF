'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { showInfo, showError } from '@/lib/swal';

export interface ExportColumn {
  header: string;
  value: (row: any) => string | number | null | undefined;
}

interface Props {
  /** Función que obtiene TODOS los datos (con all=true) */
  fetchData: () => Promise<{ data: any[] }>;
  /** Columnas a exportar — header + función que extrae el valor de cada fila */
  columns: ExportColumn[];
  /** Nombre del archivo sin extensión */
  filename: string;
  /** Formato: xlsx o csv */
  format?: 'xlsx' | 'csv';
}

export default function ExportButton({ fetchData, columns, filename, format = 'xlsx' }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      const rows = result.data ?? [];
      if (!rows.length) { showInfo('No hay datos para exportar'); return; }

      const headers = columns.map((c) => c.header);
      const cleanNum = (v: unknown) => {
        if (v == null || v === '') return '';
        const n = Number(v);
        if (!isFinite(n)) return v;
        return Number.isInteger(n) ? n : parseFloat(n.toFixed(4).replace(/\.?0+$/, ''));
      };
      const data = rows.map((row) => columns.map((c) => cleanNum(c.value(row))));

      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

      // Auto-width columns
      ws['!cols'] = headers.map((h, i) => {
        const maxLen = Math.max(h.length, ...data.map((r) => String(r[i] ?? '').length));
        return { wch: Math.min(maxLen + 2, 50) };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');

      if (format === 'csv') {
        XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' });
      } else {
        XLSX.writeFile(wb, `${filename}.xlsx`);
      }
    } catch (e) {
      console.error('Error al exportar:', e);
      showError('Error al exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 shrink-0"
    >
      <Download size={16} />
      <span className="hidden sm:inline">{loading ? 'Exportando...' : 'Exportar'}</span>
    </button>
  );
}
