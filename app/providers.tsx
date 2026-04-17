'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';

function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (pathname.startsWith('/profile')) {
      const timer = setTimeout(() => {
        void refreshUser();
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [pathname, refreshUser]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent font-sans text-slate-900">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-blue-300/25 blur-3xl" />
        <div className="absolute right-[-8%] top-16 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl" />
        <div className="absolute bottom-[-8%] left-1/3 h-72 w-72 rounded-full bg-cyan-200/25 blur-3xl" />
      </div>

      <Navbar />

      <main className="relative mx-auto max-w-[1440px] px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: '20px',
            background: 'rgba(12, 21, 42, 0.92)',
            color: '#f8fbff',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
          },
        }}
      />
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutChrome>{children}</LayoutChrome>
    </AuthProvider>
  );
}
