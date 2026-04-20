'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type ProfileResponse = {
  name: string;
  image: string;
  headline: string;
  bio: string;
  location: string;
  website: string;
  walletAddress: string;
  orcid: string;
  publications: string[];
  affiliations: string[];
  keywords: string[];
};

const defaultProfile: ProfileResponse = {
  name: '',
  image: '',
  headline: '',
  bio: '',
  location: '',
  website: '',
  walletAddress: '',
  orcid: '',
  publications: [],
  affiliations: [],
  keywords: [],
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse>(defaultProfile);
  const [draft, setDraft] = useState<ProfileResponse>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/orcid/profile', { cache: 'no-store' });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || 'Failed to load profile');
        }

        const data = (await response.json()) as ProfileResponse;
        const next = { ...defaultProfile, ...data };
        setProfile(next);
        setDraft(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const reputationScore = useMemo(() => profile.publications.length * 10, [profile.publications.length]);
  const novaBalance = useMemo(() => profile.publications.length * 5, [profile.publications.length]);

  const saveProfile = async () => {
    setSaving(true);
    setSaved('');
    setError('');

    try {
      const response = await fetch('/api/orcid/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          image: draft.image,
          headline: draft.headline,
          bio: draft.bio,
          location: draft.location,
          website: draft.website,
          walletAddress: draft.walletAddress,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || 'No se pudo guardar el perfil.');
      }

      setProfile((previous) => ({
        ...previous,
        name: draft.name,
        image: draft.image,
        headline: draft.headline,
        bio: draft.bio,
        location: draft.location,
        website: draft.website,
        walletAddress: draft.walletAddress,
      }));
      setSaved('Perfil actualizado correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <main className="mx-auto max-w-4xl p-6">Loading profile...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Inicia sesión para ver tu perfil</h1>
          <p className="mt-2 text-slate-600">
            El perfil, la conexión ORCID y tu wallet NOVAS están asociados a tu cuenta autenticada.
          </p>
          <Link href="/auth/signin" className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Ir a inicio de sesión
          </Link>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</section>
      </main>
    );
  }

  const onboardingSteps = [
    { label: 'Conectar ORCID', done: Boolean(profile.orcid), cta: 'Conectar ORCID', href: '/api/oauth/orcid' },
    { label: 'Completar perfil básico', done: Boolean(profile.name && profile.headline && profile.bio), cta: 'Completar datos', href: '#edit-profile' },
    { label: 'Vincular wallet NOVAS', done: Boolean(profile.walletAddress), cta: 'Agregar wallet', href: '#edit-profile' },
  ];
  const completedSteps = onboardingSteps.filter((step) => step.done).length;
  const profileCompletion = Math.round((completedSteps / onboardingSteps.length) * 100);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.image} alt={profile.name || 'Profile photo'} className="h-20 w-20 rounded-full border object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-slate-100 text-xl font-semibold text-slate-600">
                {(profile.name || 'NS')
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{profile.name || 'Investigador/a'}</h1>
              <p className="mt-1 text-sm text-slate-600">{profile.headline || 'Conecta ORCID y completa tu perfil profesional.'}</p>
              <p className="mt-1 text-xs text-slate-500">ORCID: {profile.orcid || 'Not connected'}</p>
            </div>
          </div>
          <a
            href={profile.orcid ? `https://orcid.org/${profile.orcid}` : 'https://orcid.org'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Ver ORCID público
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Onboarding Nova</h2>
              <p className="text-sm text-slate-600">
                Progreso del perfil: <span className="font-semibold text-slate-900">{profileCompletion}%</span>
              </p>
            </div>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {onboardingSteps.map((step) => (
              <div key={step.label} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-800">{step.label}</p>
                <p className={`mt-1 text-xs ${step.done ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {step.done ? 'Completado' : 'Pendiente'}
                </p>
                {!step.done && (
                  <a href={step.href} className="mt-3 inline-flex text-xs font-medium text-blue-600 hover:underline">
                    {step.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase text-slate-500">Reputation score</h2>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{reputationScore}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase text-slate-500">NOVAS balance</h2>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">{novaBalance}</p>
          <p className="mt-2 text-xs text-slate-500">Wallet: {profile.walletAddress || 'No vinculada'}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase text-slate-500">Producción científica</h2>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{profile.publications.length}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article id="edit-profile" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Editar perfil</h2>
          <p className="mt-1 text-sm text-slate-600">Puedes editar tu información visible en el portal sin tocar tus datos oficiales en ORCID.</p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Nombre</span>
              <input
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Titular profesional</span>
              <input
                value={draft.headline}
                onChange={(event) => setDraft((prev) => ({ ...prev, headline: event.target.value }))}
                placeholder="Ej: Investigador en IA biomédica"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">URL de foto</span>
              <input
                value={draft.image}
                onChange={(event) => setDraft((prev) => ({ ...prev, image: event.target.value }))}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Ubicación</span>
              <input
                value={draft.location}
                onChange={(event) => setDraft((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="Ciudad, País"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Sitio web</span>
              <input
                value={draft.website}
                onChange={(event) => setDraft((prev) => ({ ...prev, website: event.target.value }))}
                placeholder="https://tu-sitio.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Wallet NOVAS</span>
              <input
                value={draft.walletAddress}
                onChange={(event) => setDraft((prev) => ({ ...prev, walletAddress: event.target.value }))}
                placeholder="0x..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Biografía</span>
              <textarea
                value={draft.bio}
                onChange={(event) => setDraft((prev) => ({ ...prev, bio: event.target.value }))}
                rows={5}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && <p className="text-sm text-emerald-700">{saved}</p>}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Datos ORCID importados</h2>

          <div className="mt-4 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Publicaciones</h3>
              {profile.publications.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">No publications available.</p>
              ) : (
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {profile.publications.slice(0, 10).map((publication) => (
                    <li key={publication}>{publication}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800">Afiliaciones</h3>
              {profile.affiliations.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">No affiliations available.</p>
              ) : (
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {profile.affiliations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800">Keywords</h3>
              {profile.keywords.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">No keywords available.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
