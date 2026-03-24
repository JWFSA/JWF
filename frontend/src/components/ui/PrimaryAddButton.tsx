'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const baseClass =
  'inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shrink-0';

type BaseProps = {
  /** Texto visible desde `sm` en adelante */
  label: string;
  /** Texto en pantallas chicas */
  shortLabel: string;
  className?: string;
  icon?: ReactNode;
};

export type PrimaryAddButtonProps = BaseProps &
  ({ href: string; onClick?: never } | { href?: undefined; onClick: () => void });

export default function PrimaryAddButton({
  label,
  shortLabel,
  href,
  onClick,
  className = '',
  icon = <Plus size={16} />,
}: PrimaryAddButtonProps) {
  const cls = `${baseClass} ${className}`.trim();
  const body = (
    <>
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{shortLabel}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}
