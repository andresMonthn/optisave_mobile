-- ===========================================================================
-- OptiSave Mobile — Supabase schema
-- ===========================================================================
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query).
-- It is idempotent-ish: safe enums/tables use IF NOT EXISTS; policies are
-- dropped-and-recreated. Mirrors src/lib/database.types.ts.
--
-- After running it, copy your Project URL + anon key into the app's .env
-- (see .env.example) and restart Expo with `npx expo start -c`.
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- Enums -----
do $$ begin
  create type appointment_status as enum
    ('pendiente','confirmada','completada','cancelada','no_asistio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_status as enum ('pendiente','verificado','rechazado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type license_type as enum
    ('licenciatura','especialidad','subespecialidad','maestria','doctorado');
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------------- Tables -----

create table if not exists public.doctors (
  id                  uuid primary key references auth.users (id) on delete cascade,
  prefix              text,
  full_name           text not null default '',
  avatar_url          text,
  specialty           text,
  subspecialties      text[] not null default '{}',
  years_experience    integer not null default 0,
  consultation_price  numeric not null default 0,
  currency            text not null default 'MXN',
  price_note          text,
  languages           text[] not null default '{}',
  statement           text,
  rating_avg          numeric not null default 0,
  rating_count        integer not null default 0,
  profile_views       integer not null default 0,
  is_published        boolean not null default false,
  verification_status verification_status not null default 'pendiente',
  phone               text,
  email               text,
  city                text,
  state               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.specialties (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  slug text unique not null
);

create table if not exists public.doctor_specialties (
  doctor_id    uuid references public.doctors (id) on delete cascade,
  specialty_id uuid references public.specialties (id) on delete cascade,
  primary key (doctor_id, specialty_id)
);

create table if not exists public.clinics (
  id           uuid primary key default gen_random_uuid(),
  doctor_id    uuid not null references public.doctors (id) on delete cascade,
  name         text not null,
  photo_url    text,
  address_line text not null,
  city         text not null,
  state        text not null,
  postal_code  text,
  phone        text,
  lat          numeric,
  lng          numeric,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.doctor_licenses (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   uuid not null references public.doctors (id) on delete cascade,
  type        license_type not null,
  number      text not null,
  institution text not null,
  year        integer
);

create table if not exists public.doctor_focus_areas (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   uuid not null references public.doctors (id) on delete cascade,
  title       text not null,
  icon        text,
  description text,
  sort_order  integer not null default 0
);

create table if not exists public.doctor_schedules (
  id         uuid primary key default gen_random_uuid(),
  doctor_id  uuid not null references public.doctors (id) on delete cascade,
  clinic_id  uuid references public.clinics (id) on delete set null,
  weekday    integer not null check (weekday between 0 and 6),
  start_time text not null,
  end_time   text not null
);

create table if not exists public.patients (
  id           uuid primary key default gen_random_uuid(),
  doctor_id    uuid not null references public.doctors (id) on delete cascade,
  full_name    text not null,
  avatar_url   text,
  phone        text,
  email        text,
  birth_date   date,
  gender       text,
  notes        text,
  last_visit   timestamptz,
  total_visits integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.appointments (
  id         uuid primary key default gen_random_uuid(),
  doctor_id  uuid not null references public.doctors (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  clinic_id  uuid references public.clinics (id) on delete set null,
  starts_at  timestamptz not null,
  ends_at    timestamptz,
  status     appointment_status not null default 'pendiente',
  reason     text,
  price      numeric,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  doctor_id    uuid not null references public.doctors (id) on delete cascade,
  patient_id   uuid references public.patients (id) on delete set null,
  patient_name text not null,
  rating       integer not null check (rating between 1 and 5),
  comment      text not null default '',
  is_verified  boolean not null default false,
  reply        text,
  created_at   timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_clinics_doctor on public.clinics (doctor_id);
create index if not exists idx_licenses_doctor on public.doctor_licenses (doctor_id);
create index if not exists idx_focus_doctor on public.doctor_focus_areas (doctor_id);
create index if not exists idx_schedules_doctor on public.doctor_schedules (doctor_id);
create index if not exists idx_patients_doctor on public.patients (doctor_id);
create index if not exists idx_appointments_doctor on public.appointments (doctor_id);
create index if not exists idx_appointments_starts on public.appointments (starts_at);
create index if not exists idx_reviews_doctor on public.reviews (doctor_id);

-- ------------------------------------------------------------- Triggers -----

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['doctors','clinics','patients','appointments'] loop
    execute format('drop trigger if exists trg_%s_updated on public.%s', t, t);
    execute format(
      'create trigger trg_%s_updated before update on public.%s
         for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- auto-create a doctor profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.doctors (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- recompute a doctor's rating aggregate whenever reviews change
create or replace function public.recompute_doctor_rating()
returns trigger language plpgsql as $$
declare d uuid;
begin
  d := coalesce(new.doctor_id, old.doctor_id);
  update public.doctors set
    rating_avg = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where doctor_id = d), 0),
    rating_count = (select count(*) from public.reviews where doctor_id = d)
  where id = d;
  return null;
end $$;

drop trigger if exists trg_reviews_rating on public.reviews;
create trigger trg_reviews_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_doctor_rating();

-- ----------------------------------------------------------------- RLS ------
alter table public.doctors            enable row level security;
alter table public.specialties        enable row level security;
alter table public.doctor_specialties enable row level security;
alter table public.clinics            enable row level security;
alter table public.doctor_licenses    enable row level security;
alter table public.doctor_focus_areas enable row level security;
alter table public.doctor_schedules   enable row level security;
alter table public.patients           enable row level security;
alter table public.appointments       enable row level security;
alter table public.reviews            enable row level security;

-- doctors -------------------------------------------------------------------
drop policy if exists "doctors_public_read" on public.doctors;
create policy "doctors_public_read" on public.doctors
  for select using (is_published = true);

drop policy if exists "doctors_owner_read" on public.doctors;
create policy "doctors_owner_read" on public.doctors
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "doctors_owner_insert" on public.doctors;
create policy "doctors_owner_insert" on public.doctors
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "doctors_owner_update" on public.doctors;
create policy "doctors_owner_update" on public.doctors
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "doctors_owner_delete" on public.doctors;
create policy "doctors_owner_delete" on public.doctors
  for delete to authenticated using ((select auth.uid()) = id);

-- specialties (public catalog, read-only for clients) -----------------------
drop policy if exists "specialties_public_read" on public.specialties;
create policy "specialties_public_read" on public.specialties for select using (true);

-- generic owner-CRUD + public-read-for-published helper for child tables ----
-- A row is publicly readable when its doctor's profile is published.
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'clinics','doctor_licenses','doctor_focus_areas','doctor_schedules','reviews','doctor_specialties'
  ] loop
    execute format('drop policy if exists "%s_public_read" on public.%s', tbl, tbl);
    execute format($f$
      create policy "%1$s_public_read" on public.%1$s for select using (
        exists (select 1 from public.doctors d where d.id = %1$s.doctor_id and d.is_published = true)
      )$f$, tbl);

    execute format('drop policy if exists "%s_owner_all" on public.%s', tbl, tbl);
    execute format($f$
      create policy "%1$s_owner_all" on public.%1$s for all to authenticated
        using ((select auth.uid()) = %1$s.doctor_id)
        with check ((select auth.uid()) = %1$s.doctor_id)$f$, tbl);
  end loop;
end $$;

-- patients & appointments are PRIVATE — owner only (no public read) ----------
do $$
declare tbl text;
begin
  foreach tbl in array array['patients','appointments'] loop
    execute format('drop policy if exists "%s_owner_all" on public.%s', tbl, tbl);
    execute format($f$
      create policy "%1$s_owner_all" on public.%1$s for all to authenticated
        using ((select auth.uid()) = %1$s.doctor_id)
        with check ((select auth.uid()) = %1$s.doctor_id)$f$, tbl);
  end loop;
end $$;

-- --------------------------------------------------------------- Seed -------
insert into public.specialties (name, icon, slug) values
  ('Cardiología',       'heart-outline',       'cardiologia'),
  ('Dermatología',      'body-outline',        'dermatologia'),
  ('Ginecología',       'female-outline',      'ginecologia'),
  ('Pediatría',         'happy-outline',       'pediatria'),
  ('Optometría',        'eye-outline',         'optometria'),
  ('Nutrición',         'nutrition-outline',   'nutricion'),
  ('Traumatología',     'fitness-outline',     'traumatologia'),
  ('Psicología',        'chatbubbles-outline', 'psicologia'),
  ('Odontología',       'medkit-outline',      'odontologia'),
  ('Medicina General',  'pulse-outline',       'medicina-general')
on conflict (slug) do nothing;

-- ===========================================================================
-- Done. Your doctor profile row is created automatically on sign-up by the
-- on_auth_user_created trigger; the app then fills in the rest from the
-- registration form and the profile editor.
-- ===========================================================================
