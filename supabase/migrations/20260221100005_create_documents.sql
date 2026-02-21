create table documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  doc_type text not null,
  storage_path text,
  content text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table documents enable row level security;

create policy "documents_anon_all" on documents
  for all to anon using (true) with check (true);
