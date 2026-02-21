create table grocery_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null default 'other',
  quantity text,
  requested_by uuid references people(id),
  is_checked boolean not null default false,
  notes text,
  created_at timestamptz default now() not null
);

alter table grocery_items enable row level security;

create policy "grocery_items_anon_all" on grocery_items
  for all to anon using (true) with check (true);

create index idx_grocery_items_category on grocery_items(category);
