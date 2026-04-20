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
ORCID_AUTH_BASE_URL="https://orcid.org"
```

> Producción ORCID: si despliegas en Vercel, usa la URL pública real en `ORCID_REDIRECT_URI`, por ejemplo:
> `https://tu-dominio.com/orcid/callback`.
>
> Este proyecto está configurado para ORCID real (`https://orcid.org`) y rechaza sandbox en runtime.
>
> `ORCID_REDIRECT_URI` debe ser una URL pública HTTPS (ej. Vercel), no `localhost`.

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
- `/api/auth/register` registro por correo + contraseña

## Login por correo (nuevo)

Además de ORCID, el portal permite registro/login por correo y contraseña:

- Registro: crea usuario con hash de contraseña seguro.
- Login: autenticación con credenciales usando NextAuth.
- Luego puedes completar perfil, conectar ORCID y configurar tu wallet NOVAS.


## Deploy en Vercel (importante)

Si Vercel muestra un error como `The Next.js output directory "Next.j" was not found`, corrige:

- `Framework Preset`: **Next.js**
- `Output Directory`: **.next** (o dejar vacío por defecto)
- `Build Command`: `npm run build`

Este repo también incluye `vercel.json` para fijar esos valores.


## Flujo recomendado de acceso

1. Entra a `/auth/signin` y crea cuenta (modo **Registro**) o inicia sesión con correo.
2. Ya con sesión activa, conecta ORCID con el botón `Acceder con ORCID iD`.
3. El callback ORCID asocia datos a tu usuario y luego te lleva al perfil.
