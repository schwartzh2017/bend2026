-- First, record the already-applied migrations in schema_migrations
-- This is needed because the migration tracking got out of sync
insert into supabase_migrations.schema_migrations (version, name, statements, rolled_back_at)
values 
  ('20260221174547', '20260221174547_add_payment_info_to_people.sql', '', now()),
  ('20260221174548', '20260221174548_create_settlements.sql', '', now()),
  ('20260221180000', '20260221180000_add_db_constraints.sql', '', now()),
  ('20260222000000', '20260222000000_add_grocery_category_check.sql', '', now()),
  ('20260223000001', '20260223000001_update_game_rules_content.sql', '', now())
on conflict (version) do nothing;

-- Add secret assignment columns to people table
alter table people
add column if not exists assigned_person_id uuid references people(id),
add column if not exists assigned_word text;

-- Create index for faster lookups
create index if not exists people_assigned_person_id_idx on people(assigned_person_id);
