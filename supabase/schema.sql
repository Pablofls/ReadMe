-- =============================================================
-- ReadMe · Esquema de base de datos (Supabase / Postgres)
-- -------------------------------------------------------------
-- Cómo usarlo:
--   1. Crea un proyecto en https://supabase.com (plan Free).
--   2. Ve a "SQL Editor" > "New query".
--   3. Pega TODO este archivo y dale "Run".
--   4. En "Authentication > Providers" deja habilitado "Email".
--   5. En "Authentication > URL Configuration" agrega la URL de tu
--      app (local: http://localhost:5173, prod: tu dominio Vercel)
--      tanto en "Site URL" como en "Redirect URLs".
-- =============================================================

-- ---------- PERFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  daily_goal_pages integer not null default 10 check (daily_goal_pages > 0),
  timezone text not null default 'America/Mexico_City',
  created_at timestamptz not null default now()
);

-- ---------- LIBROS ----------
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  author text,
  cover_url text,
  -- Los libros no empiezan en la página 1 ni terminan en su última página.
  start_page integer not null default 1 check (start_page >= 1),
  end_page integer not null check (end_page >= start_page),
  status text not null default 'want_to_read'
    check (status in ('want_to_read', 'reading', 'finished')),
  rating integer check (rating between 1 and 5),
  review text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists books_user_idx on public.books (user_id);
create index if not exists books_status_idx on public.books (user_id, status);

-- ---------- SESIONES DE LECTURA ----------
create table if not exists public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  session_date date not null default current_date,
  end_page integer not null,          -- página en la que se quedó
  pages_read integer not null check (pages_read >= 0),  -- calculado en el cliente al guardar
  reflection jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_date_idx
  on public.reading_sessions (user_id, session_date);
create index if not exists sessions_book_idx
  on public.reading_sessions (book_id);

-- =============================================================
-- ROW LEVEL SECURITY · cada usuario solo ve y modifica lo suyo
-- =============================================================
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.reading_sessions enable row level security;

-- profiles
drop policy if exists "perfil propio - select" on public.profiles;
create policy "perfil propio - select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "perfil propio - update" on public.profiles;
create policy "perfil propio - update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "perfil propio - insert" on public.profiles;
create policy "perfil propio - insert" on public.profiles
  for insert with check (auth.uid() = id);

-- books
drop policy if exists "libros propios - all" on public.books;
create policy "libros propios - all" on public.books
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reading_sessions
drop policy if exists "sesiones propias - all" on public.reading_sessions;
create policy "sesiones propias - all" on public.reading_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================================
-- TRIGGER · crea el perfil automáticamente al registrarse
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- MIGRACIONES INCREMENTALES (correr en SQL Editor si ya tienes datos)
-- =============================================================

-- v2: protege pages_read contra negativos
alter table public.reading_sessions
  drop constraint if exists reading_sessions_pages_read_check;
alter table public.reading_sessions
  add constraint reading_sessions_pages_read_check check (pages_read >= 0);
