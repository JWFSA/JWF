'use client';

import { useState, useRef } from 'react';
import { formatMoney, parseMoney } from '@/lib/utils';

interface Props {
  value: number;
  onChange: (value: number) => void;
  decimals?: number;
  min?: number;
  max?: number;
  className?: string;
  placeholder?: string;
}

export default function MoneyInput({ value, onChange, decimals = 0, min, max, className = '', placeholder }: Props) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setFocused(true);
    setRaw(value ? String(value) : '');
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseMoney(raw);
    const clamped = min != null && parsed < min ? min : max != null && parsed > max ? max : parsed;
    onChange(clamped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      type={focused ? 'number' : 'text'}
      step={focused ? Math.pow(10, -decimals) : undefined}
      min={focused ? min : undefined}
      max={focused ? max : undefined}
      value={focused ? raw : (value ? formatMoney(value, decimals) : '')}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder ?? '0'}
      className={className}
    />
  );
}
