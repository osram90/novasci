# Nova Scientia Web

Frontend y API base de **Nova Scientia** con Next.js App Router, NextAuth y Prisma (SQLite).

## Ejecutar localmente

1. Instala dependencias:

```bash
npm install
```

2. Configura entorno:

```bash
cp .env.example .env
```

Define ORCID en `.env`:

```env
ORCID_CLIENT_ID=""
ORCID_CLIENT_SECRET=""
ORCID_REDIRECT_URI="http://localhost:3000/orcid/callback"
ORCID_AUTH_BASE_URL="https://sandbox.orcid.org"
```

3. Inicializa base de datos y cliente Prisma:

```bash
npx prisma generate
npx prisma db push
```

4. Ejecuta frontend:

```bash
npm run dev
```

Luego abre `http://localhost:3000`.

## Rutas útiles

- `/` portada estilo feed científico
- `/api/articles` feed de artículos para home
- `/profile` perfil con datos ORCID parseados
- `/editor` editor científico
- `/article/:id` vista de artículo
- `/api/orcid/profile` endpoint del perfil ORCID
- `/api/oauth/orcid` inicia OAuth de ORCID
- `/orcid/callback` callback visual de ORCID
- `/auth/signin` login personalizado
