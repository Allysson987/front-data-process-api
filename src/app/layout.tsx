// src/app/layout.tsx
import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'JurisData — Inteligência e Consulta Jurídica',
  description: 'Plataforma para consultas em diários oficiais e acompanhamento de processos judiciais.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#F4F2EE] text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}