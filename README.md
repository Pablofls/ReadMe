# 📚 ReadMe

App tipo Duolingo para llevar el rastro de tus lecturas: **rachas diarias con metas**, una
**biblioteca** (leyendo / quiero leer / terminados), **registro de páginas por día**,
**preguntas de comprensión** tras cada registro, y **calificar + reseñar** cada libro al
terminarlo.

Pensada para usarse desde el teléfono (agrégala a tu pantalla de inicio como atajo) pero se ve
bien también en computadora. Es **gratis**: hosting en **Vercel** + base de datos en **Supabase**.

## Stack

- **React + Vite + TypeScript** (SPA)
- **Tailwind CSS** (diseño mobile-first gamificado)
- **Supabase** (autenticación con enlace mágico + Postgres)
- **TanStack Query** (caché de datos) · **React Router** · **lucide-react** (íconos)

---

## 1. Configurar Supabase (base de datos gratis)

1. Crea una cuenta en [supabase.com](https://supabase.com) y un **New project** (plan Free).
2. En el panel del proyecto ve a **SQL Editor → New query**.
3. Abre el archivo [`supabase/schema.sql`](supabase/schema.sql) de este repo, copia **todo** su
   contenido, pégalo y dale **Run**. Esto crea las tablas (`profiles`, `books`,
   `reading_sessions`), las reglas de seguridad por usuario (RLS) y el trigger que crea tu perfil
   automáticamente al registrarte.
4. Ve a **Authentication → Providers** y deja habilitado **Email**.
5. Ve a **Authentication → URL Configuration** y agrega tus URLs en *Site URL* y *Redirect URLs*:
   - Local: `http://localhost:5173`
   - Producción: la URL que te dé Vercel (p. ej. `https://readme-tu-usuario.vercel.app`)
6. Ve a **Project Settings → API** y copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

> La `anon key` es pública por diseño; la seguridad real la dan las políticas RLS del paso 3.

---

## 2. Correr en local

```bash
# Instalar dependencias
npm install

# Crear tu archivo de entorno
cp .env.example .env.local
# y rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY con los valores del paso 1.6

# Arrancar
npm run dev
```

Abre http://localhost:5173, escribe tu correo, abre el enlace mágico que te llega y listo.

Otros comandos:

```bash
npm test        # tests de la lógica de páginas y rachas
npm run build   # build de producción (genera dist/)
npm run preview # previsualizar el build
```

---

## 3. Desplegar en Vercel (hosting gratis)

1. Sube este repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
3. Vercel detecta **Vite** automáticamente (build: `npm run build`, output: `dist`).
4. En **Environment Variables** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. **Deploy**. Copia la URL resultante y agrégala en Supabase (paso 1.5) para que el enlace
   mágico funcione en producción.

El archivo [`vercel.json`](vercel.json) ya incluye el *rewrite* de SPA para que las rutas
(`/biblioteca`, `/libro/:id`, etc.) funcionen al recargar.

### Agregarla a tu teléfono como "app"

- **iPhone (Safari):** Compartir → *Agregar a inicio*.
- **Android (Chrome):** menú ⋮ → *Agregar a pantalla principal*.

Se abrirá a pantalla completa con su propio icono.

---

## Cómo funciona el cálculo de páginas

Los libros no empiezan en la página 1 ni terminan en su última página. Por eso cada libro guarda
`start_page` (donde empieza el contenido real) y `end_page` (donde termina). Al registrar "me
quedé en la página X", la app calcula las páginas leídas (`X` − última página marcada) y el
progreso sobre el rango real del libro. Toda esta lógica vive en
[`src/lib/pages.ts`](src/lib/pages.ts) y las rachas en [`src/lib/streaks.ts`](src/lib/streaks.ts),
ambas con tests.

## Estructura

```
src/
  lib/        supabase, types, pages (matemática), streaks (rachas), preguntas
  hooks/      useAuth, useProfile, useBooks, useSessions, useStreak
  components/ ui/, BookCard, AddBookForm, ReflectionForm
  pages/      Login, Today, Library, LogReading, BookDetail, Profile
supabase/schema.sql   # correr en el SQL Editor de Supabase
```

## Ideas futuras

- Preguntas de comprensión generadas con IA (Claude API vía Vercel Functions).
- Búsqueda automática de libros (Google Books / Open Library) para autocompletar datos.
- PWA instalable real (manifest + service worker, modo offline).
- Recordatorios / notificaciones de lectura.
