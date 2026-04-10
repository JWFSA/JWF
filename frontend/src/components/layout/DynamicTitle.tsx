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
  '/fac/pedidos': 'Pedidos',
  '/fac/clientes': 'Clientes',
  '/fac/vendedores': 'Vendedores',
  '/fac/listas-precio': 'Listas de precio',
  '/fac/zonas': 'Zonas',
  '/fac/categorias': 'Categorías',
  '/fac/condiciones': 'Condiciones',
  // Finanzas
  '/fin/proveedores': 'Proveedores',
  '/fin/bancos': 'Bancos',
  '/fin/formas-pago': 'Formas de pago',
  '/fin/ramos': 'Ramos',
  '/fin/tipos-proveedor': 'Tipos de proveedor',
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
    const title = pageTitle === 'JWF' ? 'JWF' : `${pageTitle} | JWF`;
    document.title = title;

    // Observe <title> to re-apply if Next.js hydration overwrites it
    const el = document.querySelector('title');
    if (!el) return;
    const obs = new MutationObserver(() => {
      if (document.title !== title) document.title = title;
    });
    obs.observe(el, { childList: true, characterData: true, subtree: true });
    return () => obs.disconnect();
  }, [pathname]);

  return null;
}
