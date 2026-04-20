'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function EditorPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <section className="mx-auto max-w-4xl p-6">Cargando editor...</section>;
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">EditorExperience</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Inicia sesión para publicar</h1>
        <p className="mt-3 text-slate-600">
          Para crear y enviar artículos científicos debes autenticarte y completar tu perfil ORCID.
        </p>
        <Link
          href="/auth/signin"
          className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Ir a iniciar sesión
        </Link>
      </section>
    );
  }

  return (
    <section className="nova-card mx-auto max-w-4xl rounded-2xl border bg-white p-8">
      <p className="text-sm text-slate-500">EditorExperience</p>
      <h1 className="mt-2 text-2xl font-bold">Editor científico</h1>
      <p className="mt-3 text-slate-600">Aquí podrás redactar y enviar artículos para revisión.</p>
    </section>
  );
}
