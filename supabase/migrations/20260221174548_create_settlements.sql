create table settlements (
  id uuid default gen_random_uuid() primary key,
  from_person_id uuid not null references people(id) on delete cascade,
  to_person_id uuid not null references people(id) on delete cascade,
  amount_cents integer not null,
  sender_confirmed boolean not null default false,
  receiver_confirmed boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table settlements enable row level security;

create policy "settlements_anon_all" on settlements
  for all to anon using (true) with check (true);
