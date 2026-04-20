import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function getOrigin() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

function buildSigninUrl(errorMessage?: string) {
  const params = new URLSearchParams({ mode: 'login' });

  if (errorMessage) {
    params.set('orcid_error', errorMessage.slice(0, 180));
  }

  return `/auth/signin?${params.toString()}`;
}

export default async function OrcidCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const codeValue = resolvedParams.code;
  const errorValue = resolvedParams.error;

  const code = typeof codeValue === 'string' ? codeValue : undefined;
  const error = typeof errorValue === 'string' ? errorValue : undefined;

  if (error) {
    redirect(buildSigninUrl(`ORCID devolvió un error: ${error}`));
  }

  if (!code) {
    redirect(buildSigninUrl('No se recibió código de autorización ORCID.'));
  }

  const cookieStore = await cookies();
  const origin = getOrigin();

  const response = await fetch(`${origin}/api/oauth/orcid/callback?code=${encodeURIComponent(code)}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    redirect(buildSigninUrl(payload?.error || 'No se pudo completar la conexión con ORCID.'));
  }

  redirect('/profile');
}
