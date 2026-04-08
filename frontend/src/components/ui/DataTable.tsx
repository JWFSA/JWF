'use client';

import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Trash2 } from 'lucide-react';
import type { Key, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { confirmDelete } from '@/lib/swal';

export interface DataTableColumnDef<T> {
  key: string;
  header: ReactNode;
  headerClassName?: string;
  cell: (row: T) => ReactNode;
  cellClassName?: string;
  /** Si está presente, la columna es ordenable y este valor se pasa al callback onSortChange */
  sortKey?: string;
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
  /** Campo actualmente ordenado */
  sortField?: string;
  /** Dirección del ordenamiento actual */
  sortDir?: 'asc' | 'desc';
  /** Llamado cuando el usuario hace clic en un encabezado de columna ordenable */
  onSortChange?: (field: string, dir: 'asc' | 'desc') => void;
  /** Botones extra de acción por fila (se muestran antes de editar/eliminar) */
  extraActions?: (row: T) => ReactNode;
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
  sortField,
  sortDir,
  onSortChange,
  extraActions,
}: DataTableProps<T>) {
  const hasActions = !!(onEdit || onDelete || extraActions);
  const colSpan = columns.length + (hasActions ? 1 : 0);

  const handleSort = (key: string) => {
    if (!onSortChange) return;
    if (sortField === key) {
      onSortChange(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(key, 'asc');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className={tableClassName}>
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3', col.headerClassName)}>
                {col.sortKey ? (
                  <button
                    type="button"
                    onClick={() => handleSort(col.sortKey!)}
                    className="flex items-center gap-1 hover:text-gray-800 transition select-none"
                  >
                    {col.header}
                    {sortField === col.sortKey ? (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    ) : (
                      <ChevronsUpDown size={12} className="opacity-40" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
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
              <tr key={getRowKey(row)} className={cn('hover:bg-gray-50 transition', onEdit && 'cursor-pointer')}
                onClick={() => onEdit?.(row)}>
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.cellClassName)}>
                    {col.cell(row)}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      {extraActions && extraActions(row)}
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
                          onClick={async () => {
                            if (await confirmDelete(deleteConfirmMessage)) onDelete(row);
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
