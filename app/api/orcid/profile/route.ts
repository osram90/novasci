import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { toOrcidProfile } from '@/lib/orcid';

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
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
    orcid: profile.orcid || user.orcidId || '',
    publications: profile.publications,
    affiliations: profile.affiliations,
    keywords: profile.keywords,
  });
}
