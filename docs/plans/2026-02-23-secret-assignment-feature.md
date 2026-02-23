# Secret Assignment Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new "Your Secret Project Has Been Assigned" section to the home page that appears starting Thursday Feb 26, 2026, showing each logged-in user a personalized secret assignment to get another trip participant to say a specific word.

**Architecture:** Add two new columns to the `people` table for storing per-user assignments (`assigned_person_id`, `assigned_word`). Create a client component for the hide/show toggle. Fetch assignment data in the home page data layer and render conditionally.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL)

---

## Prerequisites

Check these files before starting:
- `app/(app)/home/page.tsx` - existing home page structure
- `lib/homePageData.ts` - home page data fetching logic
- `lib/supabase/types.ts` - TypeScript types for database tables
- `supabase/migrations/20260221100000_create_people.sql` - existing people table schema
- `components/HomeCard.tsx` - existing card wrapper component

---

## Task 1: Create Database Migration

**Files:**
- Create: `supabase/migrations/20260226000000_add_secret_assignment_columns.sql`

**Step 1: Write migration SQL**

```sql
-- Add secret assignment columns to people table
alter table people
add column assigned_person_id uuid references people(id),
add column assigned_word text;

-- Create index for faster lookups
create index people_assigned_person_id_idx on people(assigned_person_id);
```

**Step 2: Create seed data SQL for random assignments**

In the same migration file, add a function to randomly assign each person to another person with a random word:

```sql
-- Seed random assignments
-- Words: fun, non-explicit English words
do $$
declare
  person_record record;
  target_record record;
  words text[] := array[
    'adventure', 'sunshine', 'banjo', 'waffle', 'squirrel',
    'umbrella', 'bubble', 'cactus', 'dolphin', 'elephant',
    'flamingo', 'guitar', 'hammock', 'igloo', 'jellyfish',
    'kangaroo', 'lemonade', 'mountain', 'nectar', 'octopus',
    'paddle', 'quilt', 'rainbow', 'sunset', 'turtle',
    'unicorn', 'volcano', 'waterfall', 'xylophone', 'yodel',
    'zephyr', 'biscuit', 'cobblestone', 'dandelion', 'evergreen',
    'fiddlehead', 'gargoyle', 'huckleberry', 'innocent', 'jasmine',
    'kaleidoscope', 'lighthouse', 'marigold', 'nostalgia', 'orchid',
    'papyrus', 'quicksand', 'raspberry', 'saffron', 'thunder'
  ];
  people_array uuid[] := array(SELECT id FROM people);
  person_count int;
  random_word text;
begin
  person_count := array_length(people_array, 1);
  
  for person_record in select id from people loop
    -- Select a random person who is not themselves
    loop
      select id into target_record.id 
      from people 
      where id != person_record.id 
      and id != all(
        COALESCE(
          (SELECT array_agg(id) FROM people WHERE assigned_person_id = person_record.id),
          array[]::uuid[]
        )
      )
      order by random() 
      limit 1;
      
      exit when found;
    end loop;
    
    -- Select a random word
    random_word := words[1 + floor(random() * array_length(words, 1))::int];
    
    -- Update the person with their assignment
    update people 
    set assigned_person_id = target_record.id, 
        assigned_word = random_word
    where id = person_record.id;
  end loop;
end $$;
```

**Step 3: Commit the migration**

```bash
git add supabase/migrations/20260226000000_add_secret_assignment_columns.sql
git commit -m "feat: add secret assignment columns to people table"
```

---

## Task 2: Update TypeScript Types

**Files:**
- Modify: `lib/supabase/types.ts:12-40`

**Step 1: Add new columns to people type definitions**

Update the `people` table type in the `Database` interface to include the new columns:

```typescript
// In Database['public']['Tables']['people']['Row']:
export interface Database {
  public: {
    Tables: {
      people: {
        Row: {
          id: string
          name: string
          color: string
          default_nights: number
          payment_method: string | null
          payment_handle: string | null
          assigned_person_id: string | null  // ADD
          assigned_word: string | null       // ADD
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          default_nights: number
          payment_method?: string | null
          payment_handle?: string | null
          assigned_person_id?: string | null  // ADD
          assigned_word?: string | null        // ADD
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          default_nights?: number
          payment_method?: string | null
          payment_handle?: string | null
          assigned_person_id?: string | null  // ADD
          assigned_word?: string | null        // ADD
          created_at?: string
        }
      }
      // ... rest of tables
    }
  }
}
```

**Step 2: Commit the type changes**

```bash
git add lib/supabase/types.ts
git commit -m "feat: add assigned_person_id and assigned_word to people types"
```

---

## Task 3: Create SecretAssignmentCard Component

**Files:**
- Create: `components/SecretAssignmentCard.tsx`

**Step 1: Write the component**

```typescript
'use client'

import { useState } from 'react'

type Props = {
  assignedPersonName: string
  assignedWord: string
}

export default function SecretAssignmentCard({
  assignedPersonName,
  assignedWord,
}: Props) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className="border p-5"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        boxShadow: '2px 3px 12px var(--shadow)',
      }}
    >
      <div className="flex items-start justify-between">
        <h2
          className="font-[family-name:var(--font-tenor)] text-xs uppercase tracking-[0.06em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Your Secret Project Has Been Assigned
        </h2>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="ml-2 p-1 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-primary)' }}
          aria-label={isVisible ? 'Hide assignment' : 'Show assignment'}
        >
          {isVisible ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      <div
        className="mt-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {isVisible ? (
          <p>
            Your secret assignment this weekend is to get{' '}
            <span className="font-semibold">{assignedPersonName}</span> to say{' '}
            <span className="font-semibold">{assignedWord}</span>. Do not share this
            assignment with anyone.
          </p>
        ) : (
          <p className="italic opacity-60">Click the eye to reveal your assignment</p>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit the component**

```bash
git add components/SecretAssignmentCard.tsx
git commit -m "feat: add SecretAssignmentCard component with hide/show toggle"
```

---

## Task 4: Update Home Page Data Layer

**Files:**
- Modify: `lib/homePageData.ts`

**Step 1: Add assignment data to HomePageData type**

```typescript
// Add to HomePageData type
export type HomePageData = {
  tripStartDate: string | null
  upcomingEvents: Tables<'events'>[]
  personId: string | null
  personName: string | null
  balanceCents: number | null
  myTransactions: HomePageTransaction[]
  recentGroceries: GroceryItemWithPerson[]
  secretAssignment: {          // ADD
    assignedPersonName: string
    assignedWord: string
  } | null
}
```

**Step 2: Fetch assignment data in getHomePageData**

After fetching people data, extract the assignment:

```typescript
// After fetching people data (around line 86-89), add:
let secretAssignment: { assignedPersonName: string; assignedWord: string } | null = null

if (personId && peopleData) {
  const person = people.find((p) => p.id === personId)
  
  // Get assignment if it exists
  if (person?.assigned_person_id && person?.assigned_word) {
    const assignedPerson = people.find((p) => p.id === person.assigned_person_id)
    if (assignedPerson) {
      secretAssignment = {
        assignedPersonName: assignedPerson.name,
        assignedWord: person.assigned_word,
      }
    }
  }
}
```

**Step 3: Include secretAssignment in return**

```typescript
return {
  tripStartDate,
  upcomingEvents,
  personId,
  personName,
  balanceCents,
  myTransactions,
  recentGroceries,
  secretAssignment,  // ADD
}
```

**Step 4: Commit the data layer changes**

```bash
git add lib/homePageData.ts
git commit -m "feat: add secret assignment data to home page"
```

---

## Task 5: Update Home Page to Render Component

**Files:**
- Modify: `app/(app)/home/page.tsx`

**Step 1: Import the new component**

```typescript
import SecretAssignmentCard from '@/components/SecretAssignmentCard'
```

**Step 2: Add conditional rendering**

Check if:
1. `data.secretAssignment` exists (person has an assignment)
2. Current date is >= Thursday Feb 26, 2026

```typescript
// Add after the imports and before the return:
const SHOW_SECRET_ASSIGNMENT_DATE = new Date('2026-02-26T00:00:00-08:00') // Pacific Time
const showSecretAssignment = 
  data.secretAssignment && new Date() >= SHOW_SECRET_ASSIGNMENT_DATE
```

**Step 3: Render the component conditionally**

In the return JSX, after `<CountdownCard>`:

```tsx
{showSecretAssignment && data.secretAssignment && (
  <SecretAssignmentCard
    assignedPersonName={data.secretAssignment.assignedPersonName}
    assignedWord={data.secretAssignment.assignedWord}
  />
)}
```

**Step 4: Commit the home page changes**

```bash
git add app/\(app\)/home/page.tsx
git commit -m "feat: add secret assignment card to home page"
```

---

## Task 6: Push Migration and Verify

**Step 1: Push the migration to Supabase**

```bash
npx supabase db push
```

**Step 2: Run typecheck**

```bash
npm run typecheck
```

**Step 3: Run lint**

```bash
npm run lint
```

**Step 4: Run build**

```bash
npm run build
```

---

## Task 7: Final Verification

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Verify the feature**

1. Navigate to the home page as a logged-in user
2. Check that the secret assignment card does NOT appear before Feb 26, 2026
3. (To test after Feb 26) Verify the card appears with the correct title
4. Click the eye icon to reveal the assignment
5. Click again to hide it
6. Verify each person sees their own unique assignment

---

## Summary

| Task | Files Changed | Description |
|------|---------------|-------------|
| 1 | +1 migration | Add columns + seed random assignments |
| 2 | +1 types | Update TypeScript types |
| 3 | +1 component | SecretAssignmentCard with toggle |
| 4 | +1 data layer | Fetch assignment in homePageData |
| 5 | +1 page | Render conditionally on date + data |
| 6 | - | Push, typecheck, lint, build |
| 7 | - | Manual verification |

**Total: 5 new files, 3 modified files**
