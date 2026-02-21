# Database Migrations & Seed Data Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create all database tables with RLS policies and seed the `people` table with trip members.

**Architecture:** Single migration file for schema (tables + RLS), separate seed file for initial data. Follows Supabase conventions: UUID primary keys, timestamptz, integer cents for money, and permissive RLS behind Next.js middleware auth.

**Tech Stack:** Supabase (PostgreSQL), SQL migrations

---

## Schema Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `people` | Trip participants | name, color |
| `events` | Schedule items | title, starts_at, ends_at, event_type |
| `expenses` | Money spent | amount_cents, paid_by, category |
| `expense_participants` | Who owes what | expense_id, person_id, nights |
| `grocery_items` | Shopping list | name, category, is_checked |
| `documents` | Uploaded docs | title, doc_type, storage_path |
| `app_config` | App settings | passcode_hash, trip_name, dates |

---

## Trip Members to Seed

| Name | Nights |
|------|--------|
| Haleigh Schwartz | 3 |
| Liz Kaniecki | 3 |
| Mike | 3 |
| Evan Watson | 2 |
| Jane Liggett | 1 |
| Mack Peters | 3 |
| Bretten Farrell | 3 |
| Noelle Arneburg | 3 |
| Simon Arneburg | 3 |
| Zani Moore | 2 |

**Note:** `nights` is NOT stored in `people` table. It's recorded per-expense in `expense_participants` for lodging expenses where proration applies.

---

### Task 1: Create Schema Migration File

**Files:**
- Create: `supabase/migrations/20260221000000_initial_schema.sql`

**Step 1: Create the migrations directory if needed**

Run: `mkdir -p supabase/migrations`
Expected: Directory created (or already exists)

**Step 2: Write the schema migration**

```sql
-- Initial schema for Bend Trip App
-- Created: 2026-02-21

-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- =============================================================================
-- TABLE: people
-- Trip participants. Seeded manually.
-- =============================================================================
create table people (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color text not null,
  created_at timestamptz default now() not null
);

alter table people enable row level security;

create policy "people_anon_all" on people
  for all to anon using (true) with check (true);

-- =============================================================================
-- TABLE: events
-- Trip schedule items.
-- =============================================================================
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

-- =============================================================================
-- TABLE: expenses
-- A single expense paid by one person.
-- =============================================================================
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

-- =============================================================================
-- TABLE: expense_participants
-- Records which people participate in each expense and their share.
-- =============================================================================
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

-- =============================================================================
-- TABLE: grocery_items
-- Collaborative grocery list.
-- =============================================================================
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

-- =============================================================================
-- TABLE: documents
-- Metadata for uploaded documents.
-- =============================================================================
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

-- =============================================================================
-- TABLE: app_config
-- Single-row table for app-wide settings.
-- =============================================================================
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

-- =============================================================================
-- INDEXES
-- =============================================================================
create index idx_expenses_paid_by on expenses(paid_by);
create index idx_expenses_date on expenses(date);
create index idx_expense_participants_expense_id on expense_participants(expense_id);
create index idx_expense_participants_person_id on expense_participants(person_id);
create index idx_grocery_items_category on grocery_items(category);
create index idx_events_starts_at on events(starts_at);
```

**Step 3: Verify file created**

Run: `ls -la supabase/migrations/`
Expected: `20260221000000_initial_schema.sql` listed

---

### Task 2: Create Seed Data Migration

**Files:**
- Create: `supabase/migrations/20260221000001_seed_people.sql`

**Step 1: Write the seed migration**

```sql
-- Seed data for people table
-- Created: 2026-02-21

-- Earth-tone colors for visual identification (hex codes)
insert into people (name, color) values
  ('Haleigh Schwartz', '#8B4513'),
  ('Liz Kaniecki', '#A0522D'),
  ('Mike', '#6B4423'),
  ('Evan Watson', '#CD853F'),
  ('Jane Liggett', '#D2691E'),
  ('Mack Peters', '#BC8F8F'),
  ('Bretten Farrell', '#F4A460'),
  ('Noelle Arneburg', '#DEB887'),
  ('Simon Arneburg', '#D2B48C'),
  ('Zani Moore', '#C4A484');
```

**Step 2: Verify file created**

Run: `ls -la supabase/migrations/`
Expected: Both migration files listed

---

### Task 3: Create Supabase Storage Bucket (Optional - for documents)

**Files:**
- Create: `supabase/migrations/20260221000002_storage_bucket.sql`

**Step 1: Write storage bucket migration**

```sql
-- Create documents storage bucket for PDF/image uploads
-- Created: 2026-02-21

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Allow anon to read documents (behind middleware auth)
create policy "documents_storage_read" on storage.objects
  for select to anon
  using (bucket_id = 'documents');

-- Allow anon to upload documents (behind middleware auth)
create policy "documents_storage_write" on storage.objects
  for insert to anon
  with check (bucket_id = 'documents');

-- Allow anon to delete documents (behind middleware auth)
create policy "documents_storage_delete" on storage.objects
  for delete to anon
  using (bucket_id = 'documents');
```

**Step 2: Verify all migrations created**

Run: `ls -la supabase/migrations/`
Expected: Three migration files listed in order

---

### Task 4: Create TypeScript Types (Optional but Recommended)

**Files:**
- Create: `lib/supabase/types.ts`

**Step 1: Generate types from Supabase schema (after push)**

Run: `npx supabase gen types typescript --project-id <project-ref> > lib/supabase/types.ts`
Expected: TypeScript types file generated

**Alternative:** Write types manually if project not yet linked:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      people: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string | null
          starts_at: string
          ends_at: string | null
          event_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location?: string | null
          starts_at: string
          ends_at?: string | null
          event_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string | null
          starts_at?: string
          ends_at?: string | null
          event_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          title: string
          description: string | null
          amount_cents: number
          paid_by: string
          category: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          amount_cents: number
          paid_by: string
          category?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          amount_cents?: number
          paid_by?: string
          category?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      expense_participants: {
        Row: {
          id: string
          expense_id: string
          person_id: string
          nights: number | null
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          person_id: string
          nights?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          person_id?: string
          nights?: number | null
          created_at?: string
        }
      }
      grocery_items: {
        Row: {
          id: string
          name: string
          category: string
          quantity: string | null
          requested_by: string | null
          is_checked: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string
          quantity?: string | null
          requested_by?: string | null
          is_checked?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          quantity?: string | null
          requested_by?: string | null
          is_checked?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          doc_type: string
          storage_path: string | null
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          doc_type: string
          storage_path?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          doc_type?: string
          storage_path?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      app_config: {
        Row: {
          id: number
          passcode_hash: string
          trip_name: string
          trip_start_date: string | null
          trip_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          passcode_hash: string
          trip_name?: string
          trip_start_date?: string | null
          trip_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          passcode_hash?: string
          trip_name?: string
          trip_start_date?: string | null
          trip_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
```

**Step 2: Verify file created**

Run: `ls -la lib/supabase/`
Expected: `types.ts` listed

---

### Task 5: Create Supabase Client File

**Files:**
- Create: `lib/supabase/client.ts`

**Step 1: Write the client file**

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Verify file created**

Run: `ls -la lib/supabase/`
Expected: `client.ts` and `types.ts` listed

---

### Task 6: Commit the Migration Files

**Step 1: Stage the files**

Run: `git add supabase/migrations/ lib/supabase/`

**Step 2: Commit**

Run: `git commit -m "add initial database schema and seed data"`
Expected: Commit created

---

## Post-Implementation

After migrations are written and committed:

1. **Link Supabase project** (if not done): `npx supabase link --project-ref <ref>`
2. **Push to Supabase**: `npx supabase db push`
3. **Verify in Supabase dashboard**: Check all tables exist and `people` is seeded

---

## Notes

- **Nights per person** is NOT in the `people` table. It's stored per-expense in `expense_participants.nights` when splitting lodging costs.
- **Colors** assigned are earth tones for Pacific Northwest aesthetic
- **Storage bucket** for documents is private (access controlled by RLS + middleware)
