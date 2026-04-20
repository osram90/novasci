import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const ORCID_AUTH_BASE_PRODUCTION = 'https://orcid.org';


function validateProductionRedirectUri(redirectUri: string) {
  if (redirectUri.includes('localhost')) {
    throw new Error('Invalid ORCID_REDIRECT_URI for production. Use your public HTTPS callback URL, not localhost.');
  }
}

function resolveOrcidAuthBaseUrl() {
  const configuredBaseUrl = process.env.ORCID_AUTH_BASE_URL?.trim();
  const baseUrl = configuredBaseUrl || ORCID_AUTH_BASE_PRODUCTION;

  if (baseUrl.includes('sandbox')) {
    throw new Error('Sandbox ORCID is disabled for this environment. Set ORCID_AUTH_BASE_URL=https://orcid.org');
  }

  return baseUrl;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    const loginUrl = new URL('/auth/signin', process.env.NEXTAUTH_URL || 'http://localhost:3000');
    loginUrl.searchParams.set('mode', 'login');
    loginUrl.searchParams.set('reason', 'orcid_requires_login');
    return NextResponse.redirect(loginUrl);
  }

  const clientId = process.env.ORCID_CLIENT_ID;
  const redirectUri = process.env.ORCID_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Missing ORCID configuration: ORCID_CLIENT_ID or ORCID_REDIRECT_URI' },
      { status: 500 },
    );
  }

  try {
    const baseUrl = resolveOrcidAuthBaseUrl();
    validateProductionRedirectUri(redirectUri);
    const authorizeUrl = new URL('/oauth/authorize', baseUrl);
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', '/authenticate');
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);

    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid ORCID configuration' },
      { status: 500 },
    );
  }
}
