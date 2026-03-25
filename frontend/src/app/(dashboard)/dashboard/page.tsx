'use client';

import { useEffect, useState } from 'react';
import { Settings, ShoppingCart, Package } from 'lucide-react';

const cards = [
  {
    label: 'General',
    description: 'Operadores, empresas, monedas, países y más',
    icon: Settings,
    color: 'bg-blue-500',
    href: '/gen/operadores',
  },
  {
    label: 'Facturación',
    description: 'Clientes, vendedores, zonas, categorías y condiciones',
    icon: ShoppingCart,
    color: 'bg-green-500',
    href: '/fac/clientes',
  },
  {
    label: 'Stock',
    description: 'Artículos, depósitos, líneas, grupos y marcas',
    icon: Package,
    color: 'bg-orange-500',
    href: '/stk/articulos',
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('jwf_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Bienvenido{user ? `, ${user.nombre}` : ''}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Panel de control JWF</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md transition"
          >
            <div className={`${card.color} p-3 rounded-lg text-white shrink-0`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{card.label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
