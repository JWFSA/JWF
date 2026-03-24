'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, Shield, Globe } from 'lucide-react';

const cards = [
  { label: 'Operadores', icon: Users, color: 'bg-blue-500', href: '/gen/operadores' },
  { label: 'Empresas', icon: Building2, color: 'bg-green-500', href: '/gen/empresas' },
  { label: 'Roles', icon: Shield, color: 'bg-purple-500', href: '/gen/roles' },
  { label: 'Sistemas', icon: Globe, color: 'bg-orange-500', href: '/gen/sistemas' },
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
        <p className="text-gray-500 text-sm mt-1">Panel de control JWF ERP</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition"
          >
            <div className={`${card.color} p-3 rounded-lg text-white`}>
              <card.icon size={22} />
            </div>
            <span className="font-medium text-gray-700">{card.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
