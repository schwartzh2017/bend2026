create extension if not exists "uuid-ossp";

create table people (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color text not null,
  created_at timestamptz default now() not null
);

alter table people enable row level security;

create policy "people_anon_all" on people
  for all to anon using (true) with check (true);
