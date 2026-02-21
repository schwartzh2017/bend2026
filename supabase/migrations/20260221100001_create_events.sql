create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  event_type text not null default 'activity',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table events enable row level security;

create policy "events_anon_all" on events
  for all to anon using (true) with check (true);

create index idx_events_starts_at on events(starts_at);
