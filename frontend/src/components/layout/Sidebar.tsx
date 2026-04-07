'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { menu } from '@/config/menu';

interface Props {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: Props) {
  const pathname = usePathname();

  const getOpenGroups = () =>
    menu.filter((item) => item.children?.some((child) => child.href && pathname.startsWith(child.href))).map((item) => item.label);

  const [open, setOpen] = useState<string[]>(getOpenGroups);

  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const groups = getOpenGroups();
    if (groups.length) {
      setOpen((prev) => {
        const merged = new Set([...prev, ...groups]);
        return [...merged];
      });
    }
    // Scroll al ítem activo después de que el grupo se expanda
    requestAnimationFrame(() => {
      const active = navRef.current?.querySelector('[data-active="true"]');
      if (active) {
        active.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    });
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpen((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <aside className="w-56 h-full bg-gray-900 text-gray-100 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
          <span className="text-xl font-bold text-white">JWF</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-white transition"
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
      </div>

      <nav ref={navRef} className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menu.map((item) => {
          if (!item.children) {
            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={handleNavClick}
                data-active={pathname === item.href || undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                  pathname === item.href
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          }

          const isOpen = open.includes(item.label);
          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGroup(item.label)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition"
              >
                <span className="flex items-center gap-3">
                  <item.icon size={16} />
                  {item.label}
                </span>
                <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
              </button>
              {isOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.filter((child) => child.href).map((child) => (
                    <Link
                      key={child.href}
                      href={child.href!}
                      onClick={handleNavClick}
                      data-active={pathname.startsWith(child.href!) || undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                        pathname.startsWith(child.href!)
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                      )}
                    >
                      <child.icon size={14} />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
