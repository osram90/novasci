'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');

  const handleOrcidLogin = () => {
    window.location.href = '/api/oauth/orcid';
  };

  const handleEmailLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    window.location.href = `/api/auth/signin/email?email=${encodeURIComponent(email)}`;
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="rounded-xl bg-blue-100 p-3 text-2xl">🎓</div>
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-800">Bienvenido a Nova Scientia</h1>
        <p className="mb-6 mt-2 text-center text-slate-500">
          La plataforma de divulgación científica con identidad verificada.
        </p>

        <button
          onClick={handleOrcidLogin}
          className="flex w-full items-center justify-center gap-3 rounded-lg border py-3 transition hover:bg-slate-50"
        >
          <span className="rounded bg-green-500 px-2 py-1 text-xs font-bold text-white">iD</span>
          <span className="font-medium text-slate-700">Acceder con ORCID iD</span>
          <span className="text-green-500">✔</span>
        </button>

        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="px-3 text-sm text-slate-400">O MEDIANTE CORREO</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@universidad.edu"
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700">
            Iniciar sesión
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Al registrarte, aceptas nuestras políticas de divulgación abierta y ética científica.
        </p>
      </section>
    </main>
  );
}
