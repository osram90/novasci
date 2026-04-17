'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function OrcidCallbackPage() {
  const params = useSearchParams();
  const code = params.get('code');
  const error = params.get('error');

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border bg-white p-8">
      <h1 className="text-2xl font-bold text-slate-900">Callback ORCID</h1>

      {error && <p className="mt-4 text-red-600">ORCID devolvió un error: {error}</p>}

      {code ? (
        <>
          <p className="mt-4 text-slate-600">Código recibido correctamente. Siguiente paso: intercambio backend por token.</p>
          <pre className="mt-4 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{code}</pre>
        </>
      ) : (
        <p className="mt-4 text-slate-600">No se recibió parámetro `code`.</p>
      )}

      <Link href="/auth/signin" className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">
        Volver a login
      </Link>
    </section>
  );
}
