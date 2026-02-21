create table app_config (
  id integer primary key default 1 check (id = 1),
  passcode_hash text not null,
  trip_name text not null default 'Bend 2026',
  trip_start_date date,
  trip_end_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table app_config enable row level security;

create policy "app_config_anon_all" on app_config
  for all to anon using (true) with check (true);
