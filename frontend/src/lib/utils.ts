import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea una fecha al formato dd/mm/aaaa. Acepta string ISO, Date o null/undefined. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const iso = value.toString().substring(0, 10); // "yyyy-mm-dd"
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '—';
  return `${d}/${m}/${y}`;
}

/** Formatea un número con separador de miles (punto) y decimales opcionales (coma). Ej: 1500000 → "1.500.000" */
export function formatMoney(value: number | string | null | undefined, decimals = 0): string {
  if (value == null || value === '') return '';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (!isFinite(n)) return '';
  return n.toLocaleString('es-PY', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Parsea un string con separadores de miles (punto) y decimal (coma) a número. Ej: "1.500.000" → 1500000 */
export function parseMoney(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isFinite(n) ? n : 0;
}

/** Convierte un valor de fecha del backend a "yyyy-mm-dd" para usar en <input type="date">. */
export function toInputDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  return value.toString().substring(0, 10);
}
