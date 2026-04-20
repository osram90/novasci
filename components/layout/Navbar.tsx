'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/editor', label: 'Editor' },
  { href: '/profile', label: 'Perfil' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  return (
    <header className="relative z-10 mx-auto mt-4 flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link href="/" className="text-xl font-extrabold tracking-tight text-slate-900">
        Nova Scientia
      </Link>

      <nav className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-1 text-sm backdrop-blur">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 transition ${
                active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        {loading ? (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-500">...</span>
        ) : user ? (
          <Link href="/profile" className="rounded-full bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700">
            Mi cuenta
          </Link>
        ) : (
          <>
            <Link href="/auth/signin?mode=signup" className="rounded-full border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
              Registro
            </Link>
            <Link href="/auth/signin" className="rounded-full bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700">
              Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
