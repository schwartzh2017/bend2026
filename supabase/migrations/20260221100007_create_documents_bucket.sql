insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_storage_read" on storage.objects
  for select to anon
  using (bucket_id = 'documents');

create policy "documents_storage_insert" on storage.objects
  for insert to anon
  with check (bucket_id = 'documents');

create policy "documents_storage_delete" on storage.objects
  for delete to anon
  using (bucket_id = 'documents');
