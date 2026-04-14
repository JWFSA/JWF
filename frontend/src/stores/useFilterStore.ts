import { create } from 'zustand';
import { useMemo } from 'react';

interface PageFilters {
  [key: string]: string;
}

interface FilterStore {
  pages: Record<string, PageFilters>;
  set: (pageId: string, key: string, value: string) => void;
  clear: (pageId: string) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  pages: {},
  set: (pageId, key, value) =>
    set((state) => ({
      pages: {
        ...state.pages,
        [pageId]: { ...state.pages[pageId], [key]: value },
      },
    })),
  clear: (pageId) =>
    set((state) => {
      const { [pageId]: _, ...rest } = state.pages;
      return { pages: rest };
    }),
}));

/**
 * Hook para leer filtros de una página con defaults.
 * Devuelve [filters, setFilter, clearFilters]
 */
export function useFilters<T extends Record<string, string>>(pageId: string, defaults: T) {
  const stored = useFilterStore((s) => s.pages[pageId]);
  const setFn = useFilterStore((s) => s.set);
  const clearFn = useFilterStore((s) => s.clear);

  const filters = useMemo(
    () => ({ ...defaults, ...stored }) as T,
    [stored] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const setFilter = (key: keyof T, value: string) => setFn(pageId, key as string, value);
  const clearFilters = () => clearFn(pageId);

  return [filters, setFilter, clearFilters] as const;
}
