create table expense_participants (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid not null references expenses(id) on delete cascade,
  person_id uuid not null references people(id),
  nights integer default null,
  created_at timestamptz default now() not null,
  unique(expense_id, person_id)
);

alter table expense_participants enable row level security;

create policy "expense_participants_anon_all" on expense_participants
  for all to anon using (true) with check (true);

create index idx_expense_participants_expense_id on expense_participants(expense_id);
create index idx_expense_participants_person_id on expense_participants(person_id);
