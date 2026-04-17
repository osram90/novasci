import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.ORCID_CLIENT_ID;
  const redirectUri = process.env.ORCID_REDIRECT_URI;
  const baseUrl = process.env.ORCID_AUTH_BASE_URL || 'https://sandbox.orcid.org';

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Missing ORCID configuration: ORCID_CLIENT_ID or ORCID_REDIRECT_URI' },
      { status: 500 },
    );
  }

  const authorizeUrl = new URL('/oauth/authorize', baseUrl);
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', '/authenticate');
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);

  return NextResponse.redirect(authorizeUrl);
}
