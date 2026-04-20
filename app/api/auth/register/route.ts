import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

type RegisterPayload = {
  name?: string;
  email?: string;
  password?: string;
};

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RegisterPayload | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must have at least 8 characters' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser?.passwordHash) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      name: name || existingUser?.name || null,
      passwordHash: hashPassword(password),
    },
    create: {
      email,
      name: name || null,
      passwordHash: hashPassword(password),
    },
  });

  return NextResponse.json({ ok: true });
}
