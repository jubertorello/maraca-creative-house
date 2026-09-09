-- Run this in the Supabase SQL editor too — adds the two tables that were
-- added to schema.sql after you first ran it (site content + brand logos).

create table if not exists site_content (
  id text primary key,
  data jsonb not null default '{}'::jsonb
);

create table if not exists clients (
  slug text primary key,
  name text not null,
  logo_url text,
  sort_order int not null default 0
);

create index if not exists clients_sort_order_idx on clients (sort_order);

alter table site_content enable row level security;
alter table clients enable row level security;

drop policy if exists "public read site_content" on site_content;
create policy "public read site_content" on site_content for select using (true);

drop policy if exists "public read clients" on clients;
create policy "public read clients" on clients for select using (true);
