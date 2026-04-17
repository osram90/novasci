'use client';

import { useEffect, useMemo, useState } from 'react';

type ProfileResponse = {
  name: string;
  orcid: string;
  publications: string[];
  affiliations: string[];
  keywords: string[];
};

const defaultProfile: ProfileResponse = {
  name: '',
  orcid: '',
  publications: [],
  affiliations: [],
  keywords: [],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/orcid/profile', { cache: 'no-store' });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || 'Failed to load profile');
        }

        const data = (await response.json()) as ProfileResponse;
        setProfile({ ...defaultProfile, ...data });
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

  if (loading) {
    return <main className="mx-auto max-w-4xl p-6">Loading profile...</main>;
  }

  if (error) {
    return <main className="mx-auto max-w-4xl p-6 text-red-600">{error}</main>;
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{profile.name || 'Unnamed researcher'}</h1>
        <p className="mt-2 text-sm text-slate-600">ORCID: {profile.orcid || 'Not connected'}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase text-slate-500">Reputation score</h2>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{reputationScore}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase text-slate-500">NOVA balance</h2>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">{novaBalance}</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Publications</h2>
        {profile.publications.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No publications available.</p>
        ) : (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {profile.publications.map((publication) => (
              <li key={publication}>{publication}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
