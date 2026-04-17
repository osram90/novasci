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
- `/api/orcid/profile` endpoint del perfil ORCID
- `/auth/signin` login personalizado
