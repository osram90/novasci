import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const ORCID_AUTH_BASE_PRODUCTION = 'https://orcid.org';
const ORCID_API_PRODUCTION = 'https://pub.orcid.org/v3.0';


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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: `ORCID error: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing ORCID authorization code' }, { status: 400 });
  }

  const clientId = process.env.ORCID_CLIENT_ID;
  const clientSecret = process.env.ORCID_CLIENT_SECRET;
  const redirectUri = process.env.ORCID_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: 'Missing ORCID configuration: ORCID_CLIENT_ID, ORCID_CLIENT_SECRET or ORCID_REDIRECT_URI' },
      { status: 500 },
    );
  }

  let authBaseUrl = ORCID_AUTH_BASE_PRODUCTION;

  try {
    authBaseUrl = resolveOrcidAuthBaseUrl();
    validateProductionRedirectUri(redirectUri);
  } catch (validationError) {
    return NextResponse.json(
      { error: validationError instanceof Error ? validationError.message : 'Invalid ORCID configuration' },
      { status: 500 },
    );
  }

  const tokenResponse = await fetch(`${authBaseUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const payload = await tokenResponse.text();
    return NextResponse.json({ error: `Failed to exchange ORCID token: ${payload}` }, { status: 502 });
  }

  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string;
    orcid?: string;
    name?: string;
  };

  if (!tokenPayload.access_token || !tokenPayload.orcid) {
    return NextResponse.json({ error: 'Invalid ORCID token payload' }, { status: 502 });
  }

  const recordResponse = await fetch(`${ORCID_API_PRODUCTION}/${tokenPayload.orcid}/record`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  });

  if (!recordResponse.ok) {
    const payload = await recordResponse.text();
    return NextResponse.json({ error: `Failed to fetch ORCID record: ${payload}` }, { status: 502 });
  }

  const recordPayload = await recordResponse.json();

  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Debes iniciar sesión antes de conectar ORCID para asociarlo a tu usuario.' },
      { status: 401 },
    );
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      orcidId: tokenPayload.orcid,
      orcidData: JSON.stringify(recordPayload),
      name: tokenPayload.name || undefined,
    },
  });

  return NextResponse.json({
    ok: true,
    orcid: tokenPayload.orcid,
  });
}
