// src/app/not-found.tsx
import Link from 'next/link';
import { Scale, ArrowLeft, Home, FileSearch } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F2EE] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Ícone e Indicador 404 */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 bg-[#1A365D]/10 rounded-2xl flex items-center justify-center">
            <Scale className="w-10 h-10 text-[#C5832B]" />
          </div>
          <span className="absolute -bottom-2 -right-2 bg-[#1A365D] text-white text-xs font-bold px-2.5 py-0.5 rounded-full border-2 border-[#F4F2EE]">
            Erro 404
          </span>
        </div>

        {/* Mensagem Principal */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1A365D]">Página Não Encontrada</h1>
          <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
            O endereço processual ou a rota consultada não existe, foi movido ou está temporariamente indisponível no sistema.
          </p>
        </div>

        {/* Card de Atalhos Rápidos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] text-left space-y-3">
          <span className="text-xs font-semibold text-[#1A365D] uppercase tracking-wider block">
            Sugestões de navegação:
          </span>
          <div className="space-y-2 text-sm">
            <Link
              href="/dashboard"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F2EE] text-[#1A365D] font-medium transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-[#C5832B]" />
                <span>Painel Principal</span>
              </div>
              <ArrowLeft className="w-4 h-4 rotate-180 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/consultas/diarios"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F2EE] text-[#1A365D] font-medium transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileSearch className="w-4 h-4 text-[#C5832B]" />
                <span>Diários Oficiais</span>
              </div>
              <ArrowLeft className="w-4 h-4 rotate-180 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Ação Principal */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#1A365D] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#233F6B] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}