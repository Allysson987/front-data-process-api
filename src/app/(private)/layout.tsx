// src/app/(private)/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Scale, History, User } from 'lucide-react';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Diários oficiais', href: '/consultas/diarios', icon: FileText },
    { name: 'Processos', href: '/consultas/processos', icon: Scale },
    { name: 'Histórico', href: '/consultas/historico', icon: History },
  ];

  return (
    <div className="flex h-screen bg-[#F4F2EE]">
      {/* Sidebar Azul Petróleo */}
      <aside className="w-64 bg-[#1A365D] text-white flex flex-col justify-between border-r border-[#1A365D]">
        <div>
          <div className="p-6 flex items-center space-x-3">
            <Scale className="w-6 h-6 text-[#C5832B]" />
            <span className="font-bold text-lg tracking-wide">JurisData</span>
          </div>

          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Menu Principal
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#2A4A7D] text-white shadow-sm'
                        : 'text-gray-300 hover:bg-[#233F6B] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-[#233F6B]">
          <Link
            href="/perfil"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#233F6B] hover:text-white transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Meu Perfil</span>
          </Link>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}