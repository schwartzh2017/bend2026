create table expenses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  amount_cents integer not null,
  paid_by uuid not null references people(id),
  category text not null default 'general',
  date date not null default current_date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table expenses enable row level security;

create policy "expenses_anon_all" on expenses
  for all to anon using (true) with check (true);

create index idx_expenses_paid_by on expenses(paid_by);
create index idx_expenses_date on expenses(date);
