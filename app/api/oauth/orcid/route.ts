import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get('callbackUrl') || '/profile';

  return NextResponse.redirect(new URL(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, url.origin));
}
