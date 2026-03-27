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

/** Convierte un valor de fecha del backend a "yyyy-mm-dd" para usar en <input type="date">. */
export function toInputDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  return value.toString().substring(0, 10);
}
