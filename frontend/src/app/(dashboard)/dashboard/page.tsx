'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Package, FileText, ShoppingCart, Building2,
  CreditCard, AlertTriangle, TrendingUp, Clock,
} from 'lucide-react';
import { getDashboard } from '@/services/gen';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-PY', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-';

const ESTADO_PEDIDO: Record<string, { label: string; cls: string }> = {
  P: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-700' },
  A: { label: 'Aprobado',  cls: 'bg-blue-100 text-blue-700' },
  F: { label: 'Facturado', cls: 'bg-green-100 text-green-700' },
  C: { label: 'Cancelado', cls: 'bg-red-100 text-red-700' },
};

function StatCard({
  label, value, sub, icon: Icon, color, href,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; href?: string;
}) {
  const inner = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition">
      <div className={`${color} p-3 rounded-lg text-white shrink-0`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Icon size={16} className="text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const stored = localStorage.getItem('jwf_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 60_000,
  });

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Panel de control JWF</p>
      </div>

      {isError && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
          No se pudo cargar el dashboard. Verificá tu conexión con el servidor.
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Clientes"
          value={isLoading ? '…' : fmt(kpis?.clientes ?? 0)}
          icon={Users}
          color="bg-blue-500"
          href="/fac/clientes"
        />
        <StatCard
          label="Artículos"
          value={isLoading ? '…' : fmt(kpis?.articulos ?? 0)}
          icon={Package}
          color="bg-orange-500"
          href="/stk/articulos"
        />
        <StatCard
          label="Proveedores"
          value={isLoading ? '…' : fmt(kpis?.proveedores ?? 0)}
          icon={Building2}
          color="bg-purple-500"
          href="/fin/proveedores"
        />
        <StatCard
          label="Facturas del mes"
          value={isLoading ? '…' : fmt(kpis?.facturasMes?.cantidad ?? 0)}
          sub={isLoading ? undefined : `Total: ${fmt(kpis?.facturasMes?.total ?? 0)}`}
          icon={FileText}
          color="bg-green-500"
          href="/fac/facturas"
        />
        <StatCard
          label="Pedidos pendientes"
          value={isLoading ? '…' : fmt(kpis?.pedidosPendientes?.cantidad ?? 0)}
          sub={isLoading ? undefined : `Total: ${fmt(kpis?.pedidosPendientes?.total ?? 0)}`}
          icon={ShoppingCart}
          color="bg-yellow-500"
          href="/fac/pedidos"
        />
        <StatCard
          label="Órdenes de pago"
          value={isLoading ? '…' : fmt(kpis?.ordenesPendientes?.cantidad ?? 0)}
          sub={isLoading ? undefined : `Total: ${fmt(kpis?.ordenesPendientes?.total ?? 0)}`}
          icon={CreditCard}
          color="bg-rose-500"
          href="/fin/ordenes-pago"
        />
      </div>

      {/* Recent activity tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Section title="Últimas facturas" icon={TrendingUp}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 bg-gray-50">
                  <th className="px-4 py-2 font-medium">Nro</th>
                  <th className="px-4 py-2 font-medium">Fecha</th>
                  <th className="px-4 py-2 font-medium">Cliente</th>
                  <th className="px-4 py-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
                  : (data?.ultimasFacturas ?? []).map((f: any) => (
                    <tr key={f.clave} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-600 whitespace-nowrap">
                        <a href="/fac/facturas" className="hover:text-blue-600">#{f.nro}</a>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(f.fecha)}</td>
                      <td className="px-4 py-3 text-gray-700 truncate max-w-[160px]">{f.cliente || '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-800 font-medium whitespace-nowrap">
                        {f.simbolo} {fmt(f.total)}
                      </td>
                    </tr>
                  ))}
                {!isLoading && (data?.ultimasFacturas ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">Sin facturas registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-50">
            <a href="/fac/facturas" className="text-xs text-blue-500 hover:underline">Ver todas →</a>
          </div>
        </Section>

        <Section title="Últimos pedidos" icon={Clock}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 bg-gray-50">
                  <th className="px-4 py-2 font-medium">Nro</th>
                  <th className="px-4 py-2 font-medium">Fecha</th>
                  <th className="px-4 py-2 font-medium">Cliente</th>
                  <th className="px-4 py-2 font-medium">Estado</th>
                  <th className="px-4 py-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                  : (data?.ultimosPedidos ?? []).map((p: any) => {
                    const est = ESTADO_PEDIDO[p.estado] ?? { label: p.estado, cls: 'bg-gray-100 text-gray-600' };
                    return (
                      <tr key={p.clave} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-gray-600 whitespace-nowrap">
                          <a href="/fac/pedidos" className="hover:text-blue-600">#{p.nro}</a>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(p.fecha)}</td>
                        <td className="px-4 py-3 text-gray-700 truncate max-w-[120px]">{p.cliente || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${est.cls}`}>
                            {est.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-800 font-medium whitespace-nowrap">
                          {fmt(p.total)}
                        </td>
                      </tr>
                    );
                  })}
                {!isLoading && (data?.ultimosPedidos ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-xs">Sin pedidos registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-50">
            <a href="/fac/pedidos" className="text-xs text-blue-500 hover:underline">Ver todos →</a>
          </div>
        </Section>
      </div>

      {/* Low stock alert — only shown when there are items */}
      {!isLoading && (data?.stockBajo ?? []).length > 0 && (
        <Section title="Artículos con stock bajo (≤ 5 unidades)" icon={AlertTriangle}>
          <div className="divide-y divide-gray-50">
            {(data?.stockBajo ?? []).map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-gray-700 truncate">{s.articulo}</span>
                <span className={`text-sm font-bold ml-4 ${s.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                  {s.stock} u.
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-2 border-t border-gray-50">
            <a href="/stk/stock" className="text-xs text-blue-500 hover:underline">Ver stock completo →</a>
          </div>
        </Section>
      )}
    </div>
  );
}
