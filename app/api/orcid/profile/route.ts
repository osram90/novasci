import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { toOrcidProfile } from '@/lib/orcid';

type ProfileUpdatePayload = {
  name?: string;
  image?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  walletAddress?: string;
};

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      image: true,
      headline: true,
      bio: true,
      location: true,
      website: true,
      walletAddress: true,
      orcidId: true,
      orcidData: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const profile = toOrcidProfile(user.orcidData);

  return NextResponse.json({
    name: profile.name || user.name || '',
    image: user.image || '',
    headline: user.headline || '',
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
    walletAddress: user.walletAddress || '',
    orcid: profile.orcid || user.orcidId || '',
    publications: profile.publications,
    affiliations: profile.affiliations,
    keywords: profile.keywords,
  });
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as ProfileUpdatePayload | null;
  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const nextName = normalizeText(payload.name, 80);
  const nextHeadline = normalizeText(payload.headline, 120);
  const nextBio = normalizeText(payload.bio, 1200);
  const nextLocation = normalizeText(payload.location, 120);
  const nextWebsite = normalizeText(payload.website, 240);
  const nextWalletAddress = normalizeText(payload.walletAddress, 120);
  const nextImage = normalizeText(payload.image, 500);

  const websiteIsValid = !nextWebsite || /^https?:\/\//i.test(nextWebsite);
  const imageIsValid = !nextImage || /^https?:\/\//i.test(nextImage);
  if (!websiteIsValid || !imageIsValid) {
    return NextResponse.json({ error: 'Website and photo URL must start with http:// or https://' }, { status: 400 });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name: nextName,
      headline: nextHeadline,
      bio: nextBio,
      location: nextLocation,
      website: nextWebsite,
      walletAddress: nextWalletAddress,
      image: nextImage,
    },
  });

  return NextResponse.json({ ok: true });
}
