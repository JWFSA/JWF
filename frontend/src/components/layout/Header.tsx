'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Menu } from 'lucide-react';
import MenuSearch from './MenuSearch';

interface Props {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<{ nombre?: string; isAdmin?: boolean } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('jwf_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    localStorage.removeItem('jwf_token');
    localStorage.removeItem('jwf_user');
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="md:hidden text-gray-500 hover:text-gray-700 transition"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>
      <div className="hidden md:block">
        <MenuSearch />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} />
          <span className="hidden sm:inline">{user?.nombre || 'Usuario'}</span>
          {user?.isAdmin && (
            <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition"
          aria-label="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
