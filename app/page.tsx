'use client';

import { useEffect, useState } from 'react';

type Article = {
  id: string;
  title: string;
  excerpt?: string;
  author: {
    name: string | null;
  };
  createdAt: string;
};

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-20 pt-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-3">
          <div>
            <h3 className="mb-3 text-xs font-semibold text-gray-400">CATEGORÍAS</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>Biotecnología</li>
              <li>Física Cuántica</li>
              <li>Ecología</li>
              <li>Ciencias Sociales</li>
              <li>Inteligencia Artificial</li>
              <li>Medicina</li>
            </ul>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h4 className="mb-2 font-semibold">Temas Tendencia</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded bg-gray-100 px-2 py-1">#OpenScience</span>
              <span className="rounded bg-gray-100 px-2 py-1">#IA</span>
              <span className="rounded bg-gray-100 px-2 py-1">#Biotech</span>
            </div>
          </div>
        </aside>

        <section className="space-y-6 lg:col-span-6">
          <div className="flex gap-6 border-b pb-2 text-sm">
            <span className="font-semibold text-blue-600">Tendencia</span>
            <span className="text-gray-500">Recientes</span>
            <span className="text-gray-500">Mejor evaluados</span>
          </div>

          {loading && <p>Cargando artículos...</p>}

          {!loading && articles.length === 0 && <p className="text-gray-500">No hay artículos aún.</p>}

          {articles.map((article) => (
            <article key={article.id} className="rounded-xl border bg-white p-5">
              <div className="mb-2 text-sm text-gray-500">{article.author?.name || 'Autor anónimo'}</div>
              <h2 className="mb-2 text-lg font-semibold">{article.title}</h2>
              <p className="text-sm text-gray-600">{article.excerpt || 'Sin resumen disponible.'}</p>
            </article>
          ))}
        </section>

        <aside className="space-y-6 lg:col-span-3">
          <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h3 className="mb-2 text-lg font-semibold">Identidad Nova</h3>
            <p className="mb-4 text-sm">Verifica tu ORCID para aumentar credibilidad científica.</p>
            <button
              onClick={() => {
                window.location.href = '/auth/signin';
              }}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600"
            >
              Verificar mi ORCID
            </button>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h4 className="mb-3 font-semibold">Últimas revisiones</h4>
            <p className="text-sm text-gray-500">Próximamente...</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
