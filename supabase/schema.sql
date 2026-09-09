-- MARACA backoffice — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Mirrors the shape of src/data/categories.json and src/data/cases.json 1:1,
-- so the migration script (scripts/migrate-to-supabase.ts) can copy the
-- current content straight across.

create table if not exists categories (
  slug text primary key,
  index text not null,
  name_es text not null,
  name_en text not null,
  enabled boolean not null default true,
  kind text, -- null = "listing" | "manifesto" | "pending"
  clients jsonb not null default '[]'::jsonb, -- string[]
  image text, -- tile image on Home + /work index; null = /media/services/<slug>.jpg
  seo_title text,
  seo_description text
);

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  category text not null references categories(slug),
  slug text not null,
  title text not null,
  client text not null,
  year text not null,
  index text not null,
  version smallint not null default 1,
  blocks jsonb not null default '[]'::jsonb,
  layout jsonb, -- null unless version 2/3
  area jsonb,   -- { ratio: "square" | "portrait" | "landscape" }
  seo_title text,
  seo_description text,
  unique (category, slug)
);

create index if not exists cases_category_idx on cases (category);

-- Fixed-page content — one row per page/section, `data` holds whatever
-- fields that page needs (see src/lib/site-content.ts). Today: id='home'
-- (hero video, "quiénes somos" text, recent-work video), id='about' (hero
-- video). Add more rows/ids as more pages get editable content — no schema
-- change needed, just a new id and shape in `data`.
create table if not exists site_content (
  id text primary key,
  data jsonb not null default '{}'::jsonb
);

-- Brand/client logos — feeds both the home carousel and the About us grid.
create table if not exists clients (
  slug text primary key,
  name text not null,
  logo_url text, -- null = shown as plain text instead of a logo image
  sort_order int not null default 0
);

create index if not exists clients_sort_order_idx on clients (sort_order);

-- Team members — Team page roster.
create table if not exists team_members (
  slug text primary key,
  name text not null,
  role_es text not null,
  role_en text not null,
  photo_url text,
  sort_order int not null default 0
);

create index if not exists team_members_sort_order_idx on team_members (sort_order);

-- Row Level Security: public (anon) can only READ; all writes go through the
-- server using the service role key (which bypasses RLS), from the /admin
-- backoffice API routes — never from the browser directly.
alter table categories enable row level security;
alter table cases enable row level security;
alter table site_content enable row level security;
alter table clients enable row level security;
alter table team_members enable row level security;

drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);

drop policy if exists "public read cases" on cases;
create policy "public read cases" on cases for select using (true);

drop policy if exists "public read site_content" on site_content;
create policy "public read site_content" on site_content for select using (true);

drop policy if exists "public read clients" on clients;
create policy "public read clients" on clients for select using (true);

drop policy if exists "public read team_members" on team_members;
create policy "public read team_members" on team_members for select using (true);
