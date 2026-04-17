import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nova Scientia',
  description: 'Portal de divulgación científica con incentivos NOVA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="mx-auto flex max-w-5xl items-center justify-between p-6">
          <Link href="/" className="text-xl font-bold">
            Nova Scientia
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-700">
            <Link href="/profile">Perfil</Link>
            <Link href="/auth/signin">Iniciar sesión</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
