import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-20 pt-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="mb-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
          Plataforma en desarrollo
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Publica ciencia, gana reputación y NOVA</h1>
        <p className="mt-4 max-w-3xl text-base text-slate-600">
          Nova Scientia es un portal para publicar artículos de divulgación, revisión colaborativa y recompensas en
          tokens NOVA.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/api/auth/signin" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Entrar con Google/ORCID
          </Link>
          <Link href="/profile" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Ver mi perfil
          </Link>
        </div>
      </section>
    </main>
  );
}
