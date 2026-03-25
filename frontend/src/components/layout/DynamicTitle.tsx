'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  // General
  '/gen/operadores': 'Operadores',
  '/gen/roles': 'Roles',
  '/gen/empresas': 'Empresas',
  '/gen/sistemas': 'Sistemas',
  '/gen/programas': 'Programas',
  '/gen/monedas': 'Monedas',
  '/gen/paises': 'Países',
  '/gen/departamentos': 'Departamentos',
  '/gen/ciudades': 'Ciudades',
  '/gen/impuestos': 'Impuestos',
  '/gen/tipos-impuesto': 'Tipos de impuesto',
  // Facturación
  '/fac/clientes': 'Clientes',
  '/fac/vendedores': 'Vendedores',
  '/fac/zonas': 'Zonas',
  '/fac/categorias': 'Categorías',
  '/fac/condiciones': 'Condiciones',
  // Stock
  '/stk/articulos': 'Artículos',
  '/stk/depositos': 'Depósitos',
  '/stk/lineas': 'Líneas',
  '/stk/grupos': 'Grupos',
  '/stk/marcas': 'Marcas',
  '/stk/rubros': 'Rubros',
  '/stk/unidades-medida': 'Unidades de medida',
};

const subPageLabels: Record<string, string> = {
  nuevo: 'Nuevo',
  editar: 'Editar',
};

function resolveTitle(pathname: string): string {
  // Exact match
  if (routeTitles[pathname]) return routeTitles[pathname];

  const segments = pathname.split('/').filter(Boolean);

  // /module/section/sub  →  try /module/section first
  for (let i = segments.length - 1; i >= 1; i--) {
    const candidate = '/' + segments.slice(0, i).join('/');
    if (routeTitles[candidate]) {
      const sub = segments[i];
      const subLabel = subPageLabels[sub];
      if (subLabel) return `${subLabel} — ${routeTitles[candidate]}`;
      // Dynamic segment (id): "Detalle — Section"
      return `Detalle — ${routeTitles[candidate]}`;
    }
  }

  return 'JWF';
}

export default function DynamicTitle() {
  const pathname = usePathname();

  useEffect(() => {
    const pageTitle = resolveTitle(pathname);
    document.title = pageTitle === 'JWF' ? 'JWF' : `${pageTitle} | JWF`;
  }, [pathname]);

  return null;
}
