'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface TablePaginationProps {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  /** Texto del contador (ej. "12 empresas"). Por defecto: "{total} registros" */
  countLabel?: string;
  /** Clases extra en el contenedor (ej. "mt-4 border-t-0" si va fuera de la tabla) */
  className?: string;
}

export default function TablePagination({
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
  countLabel,
  className = '',
}: TablePaginationProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-sm text-gray-500 ${className}`.trim()}
    >
      <div className="flex items-center gap-2">
        <span>{countLabel ?? `${total} registros`}</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </select>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Primera página"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-2">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Última página"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
