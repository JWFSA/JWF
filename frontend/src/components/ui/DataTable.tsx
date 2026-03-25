'use client';

import { Pencil, Trash2 } from 'lucide-react';
import type { Key, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DataTableColumnDef<T> {
  key: string;
  header: ReactNode;
  headerClassName?: string;
  cell: (row: T) => ReactNode;
  cellClassName?: string;
}

export interface DataTableProps<T> {
  isLoading: boolean;
  rows: T[];
  getRowKey: (row: T) => Key;
  columns: DataTableColumnDef<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  deleteConfirmMessage?: string;
  /** Clases del `<table>` (p. ej. `min-w-[560px]`). */
  tableClassName?: string;
  loadingLabel?: string;
  emptyLabel?: string;
}

export default function DataTable<T>({
  isLoading,
  rows,
  getRowKey,
  columns,
  onEdit,
  onDelete,
  deleteConfirmMessage = '¿Eliminar este registro?',
  tableClassName = 'w-full min-w-[300px] text-sm',
  loadingLabel = 'Cargando...',
  emptyLabel = 'Sin resultados',
}: DataTableProps<T>) {
  const hasActions = !!(onEdit || onDelete);
  const colSpan = columns.length + (hasActions ? 1 : 0);

  return (
    <div className="overflow-x-auto">
      <table className={tableClassName}>
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3', col.headerClassName)}>
                {col.header}
              </th>
            ))}
            {hasActions && <th className="px-4 py-3 w-20"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            <tr>
              <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-400">
                {loadingLabel}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-400">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.cellClassName)}>
                    {col.cell(row)}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="text-gray-400 hover:text-primary-600 transition"
                          aria-label="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(deleteConfirmMessage)) onDelete(row);
                          }}
                          className="text-gray-400 hover:text-red-500 transition"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
