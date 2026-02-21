---
name: supabase-patterns
description: >
  Supabase conventions, schema reference, and query patterns for the Bend Trip App.
  Load this skill whenever writing database queries, creating migrations, modifying
  schema, writing RLS policies, or working with the Supabase client. Do not deviate
  from these patterns without updating this file first.
---

# Supabase Patterns Skill — Bend Trip App

This skill defines the complete database design, conventions, and query patterns
for the Bend Trip App. Always follow these exactly. When you discover a better
pattern or fix a mistake, update this file and commit it.

---

## Project Setup

- **Client location:** `/lib/supabase/client.ts` — always import from here, never
  directly from `@supabase/supabase-js` in components or pages
- **Credentials:** stored in `.env.local` — never hardcode or commit credentials
- **RLS:** enabled on ALL tables — no exceptions
- **No realtime subscriptions** — this app uses standard fetch + manual refresh

### Client Setup (`/lib/supabase/client.ts`)
```ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## Authentication

This app uses a **shared PIN/passcode** model — no individual user accounts.
Everyone on the trip uses the same passcode to access the app.

### Implementation Pattern
- Store a hashed passcode in a `app_config` table (single row)
- On login, hash the entered PIN and compare — if match, set a session cookie
- Use Next.js middleware to protect all routes except `/login`
- No Supabase Auth (no email, no OAuth) — session managed via a simple
  httpOnly cookie with a signed token
- Session duration: 30 days (they shouldn't need to re-login during the trip)

### Protected Routes
All routes except `/login` require valid session. Implement in `middleware.ts`:
```ts
// Check for valid session cookie on every request
// Redirect to /login if missing or invalid
// Allow /login through unconditionally
```

---

## Schema Reference

### Conventions Applied to Every Table
- Primary key: `id uuid default gen_random_uuid() primary key`
- Timestamps: `created_at timestamptz default now() not null`
- Updated at (where relevant): `updated_at timestamptz default now() not null`
- No cascading deletes without explicit discussion — use soft deletes where needed

---

### Table: `people`
All trip participants. Seeded manually — no self-registration.

```sql
create table people (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color text not null, -- hex color for visual identification in expense views
  created_at timestamptz default now() not null
);
```

**Seed data:** Insert all ~10 trip members by name at setup time. This table
rarely changes. Each person gets a unique earth-tone color for UI identification.

---

### Table: `events`
Trip schedule items.

```sql
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  event_type text not null default 'activity',
  -- event_type options: 'activity' | 'meal' | 'travel' | 'lodging' | 'free'
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```

**Timezone note:** All times stored as UTC. Display in `America/Los_Angeles`.
Always use `toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })` for display.

---

### Table: `expenses`
A single expense paid by one person.

```sql
create table expenses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  amount_cents integer not null, -- ALWAYS store money as cents (integer), never float
  paid_by uuid not null references people(id),
  category text not null default 'general',
  -- category options: 'lodging' | 'food' | 'alcohol' | 'transport' | 'activities' | 'general'
  date date not null default current_date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```

**Critical:** Money is ALWAYS stored as integer cents. $16.00 = 1600. Never use
float or numeric for currency — floating point math causes rounding errors in splits.
All display formatting happens in the UI layer via a `formatCurrency()` helper.

---

### Table: `expense_participants`
The "proportional participation" model. Records exactly which people
participate in each expense and their share.

```sql
create table expense_participants (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid not null references expenses(id) on delete cascade,
  person_id uuid not null references people(id),
  nights integer default null,
  -- 'nights' used for lodging expenses: how many nights this person stayed
  -- null for non-lodging expenses
  created_at timestamptz default now() not null,
  unique(expense_id, person_id)
);
```

### How the Split Logic Works

**Standard split (food, alcohol, activities, general):**
- Insert one row per participating person into `expense_participants`
- Each participant owes: `expense.amount_cents / count(participants)`
- Non-participants are simply not inserted — they owe nothing

**Lodging split (nightly proration):**
- Insert one row per person WITH their `nights` value filled in
- Each person owes: `(expense.amount_cents / total_nights) * person.nights`
- `total_nights` = sum of all participant `nights` values for that expense
- Example: $1600 Airbnb, Person A stays 4 nights, Person B stays 2 nights,
  total_nights = 6. Person A owes (1600/6)*4 = $1066.67, Person B owes (1600/6)*2 = $533.33
- Always round to nearest cent (use Math.round)

### Calculating Balances
To calculate who owes who, always compute in the application layer (not SQL):
1. For each expense, calculate each participant's share (see logic above)
2. The payer is "owed" the total minus their own share
3. Each participant "owes" their share to the payer
4. Net all transactions per person pair to get final balances
5. Apply debt simplification (minimize number of transactions)

---

### Table: `grocery_items`
Collaborative grocery list.

```sql
create table grocery_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null default 'other',
  -- category options: 'produce' | 'protein' | 'dairy' | 'drinks' | 'snacks' | 'alcohol' | 'other'
  quantity text, -- free text: "2 lbs", "1 box", "6-pack" etc
  requested_by uuid references people(id),
  is_checked boolean not null default false,
  notes text,
  created_at timestamptz default now() not null
);
```

---

### Table: `documents`
Metadata for uploaded documents (Airbnb host doc, game rules, etc).

```sql
create table documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  doc_type text not null,
  -- doc_type options: 'airbnb_info' | 'game_rules' | 'other'
  storage_path text, -- path in Supabase Storage bucket 'documents'
  content text,      -- for plain text/markdown content stored directly
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```

**Storage:** PDF and image files go in the `documents` Supabase Storage bucket.
Simple text/markdown content can be stored directly in the `content` column.

---

### Table: `app_config`
Single-row table for app-wide settings including the access passcode.

```sql
create table app_config (
  id integer primary key default 1 check (id = 1), -- enforces single row
  passcode_hash text not null, -- bcrypt hash of the PIN
  trip_name text not null default 'Bend 2026',
  trip_start_date date,
  trip_end_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```

---

## RLS Policies

Since this app uses a custom PIN session (not Supabase Auth), RLS policies
use a simple approach: allow all operations for the anon role, but rely on
Next.js middleware to block unauthenticated requests before they reach Supabase.

```sql
-- Pattern for all tables (repeat for each table):
alter table [table_name] enable row level security;

create policy "[table_name]_anon_all" on [table_name]
  for all to anon using (true) with check (true);
```

**Important:** This is intentionally permissive at the DB level because security
is enforced at the Next.js middleware layer. If this app were public-facing with
sensitive data, we would use Supabase Auth with proper per-user RLS. For a
private trip app behind a shared PIN, this is the correct tradeoff.

---

## Migration Conventions

- All schema changes go in `/supabase/migrations/` as numbered SQL files
- Format: `YYYYMMDDHHMMSS_description.sql`
- Never edit the production database directly — always write a migration first
- Run locally with: `supabase db push`
- Always include both the table creation AND its RLS policy in the same migration file

---

## Query Patterns

### Always Use the Typed Client
```ts
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('expenses')
  .select('*, paid_by:people(*), expense_participants(*, person:people(*))')
  .order('date', { ascending: false })
```

### Error Handling Pattern
Always handle errors explicitly — never assume a query succeeded:
```ts
const { data, error } = await supabase.from('grocery_items').select('*')
if (error) {
  console.error('Failed to fetch grocery items:', error.message)
  // show user-facing error state, do not render with null data
  return
}
```

### Currency Helper (always use this, never inline)
```ts
// /lib/formatCurrency.ts
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
```

### Lodging Split Helper
```ts
// /lib/expenseLogic.ts
export function calculateLodgingShare(
  totalCents: number,
  personNights: number,
  totalNights: number
): number {
  return Math.round((totalCents / totalNights) * personNights)
}

export function calculateEvenShare(
  totalCents: number,
  participantCount: number
): number {
  return Math.round(totalCents / participantCount)
}
```

---

## Common Mistakes — Do Not Repeat

- **Never store money as float or decimal** — always integer cents
- **Never import Supabase directly** — always use `/lib/supabase/client.ts`
- **Never skip RLS** — every new table needs a policy in the same migration
- **Never display raw UTC times** — always convert to `America/Los_Angeles`
- **Never calculate balances in SQL** — do it in the application layer for flexibility
- **Never allow direct DB schema edits** — migrations only