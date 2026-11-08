// src/app/page.tsx
import Link from 'next/link';
import { Scale, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export default function HomePage() {
  // Definindo o ano de forma estática ou segura para evitar o erro de prerender
  const currentYear = 2026;

  return (
    <div className="min-h-screen bg-[#F4F2EE] flex flex-col justify-between">
      {/* Cabeçalho */}
      <header className="w-full bg-[#1A365D] text-white py-4 px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Scale className="w-6 h-6 text-[#C5832B]" />
            <span className="font-bold text-lg tracking-wide">JurisData</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/dashboard"
              className="bg-[#C5832B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#b07425] transition-colors shadow-sm"
            >
              Acessar Painel
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal / Hero */}
      <main className="max-w-6xl mx-auto px-8 py-16 flex-1 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E2E8F0] text-[#1A365D] rounded-full text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 text-[#C5832B]" />
          Inteligência Jurídica & Dados Processuais
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#1A365D] max-w-3xl mb-6 tracking-tight">
          Segurança, precisão e agilidade na pesquisa jurídica
        </h1>

        <p className="text-gray-600 max-w-xl text-base md:text-lg mb-10">
          Plataforma integrada para consultas avançadas em diários oficiais e acompanhamento de processos judiciais de ponta a ponta.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/dashboard"
            className="bg-[#1A365D] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#233F6B] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Iniciar Consultas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/consultas/diarios"
            className="bg-white text-[#1A365D] border border-[#E2E8F0] px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#1A365D]" />
            <span>Ver Diários Oficiais</span>
          </Link>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="w-full border-t border-[#E2E8F0] py-6 text-center text-xs text-gray-500">
        JurisData © {currentYear} — Todos os direitos reservados.
      </footer>
    </div>
  );
}