-- Run this too — adds the team_members table (Team page roster).
create table if not exists team_members (
  slug text primary key,
  name text not null,
  role_es text not null,
  role_en text not null,
  photo_url text,
  sort_order int not null default 0
);

create index if not exists team_members_sort_order_idx on team_members (sort_order);

alter table team_members enable row level security;

drop policy if exists "public read team_members" on team_members;
create policy "public read team_members" on team_members for select using (true);
