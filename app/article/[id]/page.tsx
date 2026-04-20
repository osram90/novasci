export default async function ArticleViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border bg-white p-8">
      <p className="text-sm text-slate-500">ArticleExperience</p>
      <h1 className="mt-2 text-2xl font-bold">Artículo #{id}</h1>
      <p className="mt-3 text-slate-600">Vista detallada del artículo (contenido en desarrollo).</p>
    </section>
  );
}
