'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [orcidLinkedNotice, setOrcidLinkedNotice] = useState(false);
  const [orcidLoginRequiredNotice, setOrcidLoginRequiredNotice] = useState(false);
  const [orcidErrorNotice, setOrcidErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    const requestedMode = searchParams.get('mode');
    if (requestedMode === 'signup') {
      setMode('signup');
    }

    if (searchParams.get('linked') === 'orcid') {
      setOrcidLinkedNotice(true);
    }

    if (searchParams.get('reason') === 'orcid_requires_login') {
      setOrcidLoginRequiredNotice(true);
    }

    const callbackError = searchParams.get('orcid_error');
    if (callbackError) {
      setOrcidErrorNotice(callbackError);
    }
  }, [searchParams]);

  const handleOrcidLogin = () => {
    toast('Redirigiendo a ORCID...');
    window.location.href = '/api/oauth/orcid';
  };

  const handleCredentialLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Credenciales inválidas');
      setLoading(false);
      return;
    }

    toast.success('Sesión iniciada');
    router.push('/profile');
    router.refresh();
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error || 'No se pudo crear la cuenta');
      }

      toast.success('Cuenta creada. Iniciando sesión...');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Cuenta creada, pero no se pudo iniciar sesión automáticamente');
      }

      router.push('/profile');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="rounded-xl bg-blue-100 p-3">
            <span className="text-2xl">🎓</span>
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-800">Bienvenido a Nova Scientia</h1>
        <p className="mb-6 mt-2 text-center text-slate-500">Plataforma de divulgación científica con identidad verificada.</p>

        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          <strong>Paso 1:</strong> crea tu cuenta o inicia sesión con correo.{' '}
          <strong>Paso 2:</strong> conecta tu ORCID para asociarlo a tu perfil.
        </div>


        {orcidLinkedNotice && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            ORCID se conectó correctamente. Inicia sesión para ir a tu perfil.
          </div>
        )}

        {orcidLoginRequiredNotice && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Para asociar ORCID a tu perfil primero debes iniciar sesión con correo y contraseña.
          </div>
        )}

        {orcidErrorNotice && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {orcidErrorNotice}
          </div>
        )}


        <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-md px-3 py-2 ${mode === 'login' ? 'bg-white font-semibold text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-md px-3 py-2 ${mode === 'signup' ? 'bg-white font-semibold text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            Registro
          </button>
        </div>

        <p className="mb-4 text-center text-xs text-slate-500">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="font-semibold text-blue-600 hover:underline"
          >
            {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión aquí'}
          </button>
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

        <form onSubmit={mode === 'login' ? handleCredentialLogin : handleRegister}>
          {mode === 'signup' && (
            <div className="mb-4">
              <label className="text-sm text-slate-600">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre"
                className="mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@universidad.edu"
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-slate-600">Contraseña {mode === 'signup' ? '(mínimo 8 caracteres)' : ''}</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Con correo puedes crear tu perfil, publicar, evaluar, donar y recibir NOVAS.
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Al registrarte aceptas nuestras políticas de divulgación abierta.
        </p>
      </div>
    </div>
  );
}
