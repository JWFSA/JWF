'use client';

import { Search } from 'lucide-react';

const inputBaseClass =
  'w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Clases extra en el contenedor `relative` (p. ej. ancho) */
  className?: string;
  /** Clases extra en el `<input>` (p. ej. `bg-white`) */
  inputClassName?: string;
}

export default function SearchField({
  value,
  onChange,
  placeholder,
  className = '',
  inputClassName = '',
}: SearchFieldProps) {
  return (
    <div className={`relative w-full sm:w-72 ${className}`.trim()}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
      <input
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputBaseClass} ${inputClassName}`.trim()}
      />
    </div>
  );
}
