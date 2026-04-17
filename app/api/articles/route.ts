import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json(
    articles.map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: article.content.slice(0, 180),
      createdAt: article.createdAt.toISOString(),
      author: article.author,
    })),
  );
}
