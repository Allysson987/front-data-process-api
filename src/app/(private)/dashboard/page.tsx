// src/app/(private)/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { Scale, FileText, History, ArrowUpRight, Search } from 'lucide-react';

export default function DashboardPage() {
  const cards = [
    {
      title: 'Diários Oficiais',
      description: 'Consulte publicações e notas de expediente emitidas pelos tribunais.',
      icon: FileText,
      href: '/consultas/diarios',
      stats: 'Sincronização ativa',
    },
    {
      title: 'Processos Judiciais',
      description: 'Pesquise andamentos e detalhes de processos por número ou parte.',
      icon: Scale,
      href: '/consultas/processos',
      stats: 'Consulta por tribunal',
    },
    {
      title: 'Histórico de Consultas',
      description: 'Acesse o registro de todas as requisições e pesquisas já realizadas.',
      icon: History,
      href: '/consultas/historico',
      stats: 'Registros salvos',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A365D]">Painel Principal</h1>
        <p className="text-gray-600 text-sm mt-1">
          Selecione o módulo desejado para efetuar buscas e acompanhar registros jurídicos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] hover:border-[#1A365D] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#F4F2EE] rounded-xl text-[#1A365D] group-hover:bg-[#1A365D] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-[#1A365D] transition-colors" />
                </div>
                <h2 className="text-lg font-semibold text-[#1A365D] mb-2">{card.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{card.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500">
                <span>{card.stats}</span>
                <span className="text-[#C5832B] font-semibold flex items-center gap-1">
                  Acessar módulo <Search className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}