'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { menu, type MenuItem } from '@/config/menu';

interface FlatItem {
  label: string;
  href: string;
  group: string;
  icon: MenuItem['icon'];
}

function flattenMenu(): FlatItem[] {
  const items: FlatItem[] = [];
  for (const group of menu) {
    if (group.href) {
      items.push({ label: group.label, href: group.href, group: '', icon: group.icon });
    }
    if (group.children) {
      for (const child of group.children) {
        if (child.href) {
          items.push({ label: child.label, href: child.href, group: group.label, icon: child.icon });
        }
      }
    }
  }
  return items;
}

const allItems = flattenMenu();

function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function MenuSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalize(query);
    return allItems.filter(
      (item) => normalize(item.label).includes(q) || normalize(item.group).includes(q)
    ).slice(0, 10);
  }, [query]);

  useEffect(() => {
    setSelected(0);
  }, [results]);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = (href: string) => {
    router.push(href);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      navigate(results[selected].href);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar menú... (Ctrl+K)"
          className="w-full sm:w-72 pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full sm:w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition ${
                  i === selected ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} className={i === selected ? 'text-primary-500' : 'text-gray-400'} />
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{item.label}</span>
                  {item.group && (
                    <span className="ml-2 text-xs text-gray-400">{item.group}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 mt-1 w-full sm:w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50 px-4 py-3 text-sm text-gray-500">
          No se encontraron resultados
        </div>
      )}
    </div>
  );
}
