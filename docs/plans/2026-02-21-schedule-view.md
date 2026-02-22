# Schedule View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a vertical timeline view at `/schedule` that displays trip events grouped by day, with color-coded event types and expandable details.

**Architecture:** Server component fetches events from Supabase, passes to client Timeline component. Timeline groups by day, renders TimelineEvent components with inline expand/collapse for details.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase

---

## Task 1: Create Supabase Client Helper

**Files:**
- Create: `lib/supabase/server.ts`

**Step 1: Write the server client helper**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**Step 2: Commit**

```bash
git add lib/supabase/server.ts
git commit -m "add supabase server client helper"
```

---

## Task 2: Create Event Type Definition

**Files:**
- Modify: `lib/supabase/types.ts`

**Step 1: Check existing types and add Event type**

First, read the existing types file to understand the Database structure. Add the Event type if not present, ensuring it matches the database schema:

```typescript
export type Event = {
  id: string
  title: string
  description: string | null
  location: string | null
  starts_at: string
  ends_at: string | null
  event_type: 'activity' | 'meal' | 'travel' | 'free'
  created_at: string
  updated_at: string
}
```

**Step 2: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "add Event type definition"
```

---

## Task 3: Create TimelineEvent Component

**Files:**
- Create: `components/TimelineEvent.tsx`

**Step 1: Write the TimelineEvent component**

```tsx
'use client'

import { useState } from 'react'

type Event = {
  id: string
  title: string
  description: string | null
  location: string | null
  starts_at: string
  ends_at: string | null
  event_type: 'activity' | 'meal' | 'travel' | 'free'
}

const eventTypeColors: Record<Event['event_type'], { border: string; dot: string }> = {
  travel: { border: 'border-[#7A9E7E]', dot: 'bg-[#7A9E7E]' },
  activity: { border: 'border-[#3D5A3E]', dot: 'bg-[#3D5A3E]' },
  meal: { border: 'border-[#A0522D]', dot: 'bg-[#A0522D]' },
  free: { border: 'border-[#8C7E6A]', dot: 'bg-[#8C7E6A]' },
}

type Props = {
  event: Event
  isExpanded: boolean
  onToggle: () => void
}

export default function TimelineEvent({ event, isExpanded, onToggle }: Props) {
  const colors = eventTypeColors[event.event_type]
  
  const startTime = new Date(event.starts_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  })

  return (
    <button
      onClick={onToggle}
      className="w-full text-left group"
    >
      <div className={`flex gap-4 py-4 border-l-2 pl-4 ${colors.border}`}>
        <div className="flex flex-col items-center">
          <div className={`w-2 h-2 rounded-full -ml-[21px] ${colors.dot}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <time className="font-mono text-sm text-[var(--text-muted)]">
              {startTime}
            </time>
            <h3 className="font-[family-name:var(--font-playfair)] italic text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
              {event.title}
            </h3>
          </div>
          
          <div
            className={`overflow-hidden transition-all duration-200 ${
              isExpanded ? 'max-h-40 mt-2' : 'max-h-0'
            }`}
          >
            {event.description && (
              <p className="font-[family-name:var(--font-source-serif)] text-[var(--text-secondary)] text-sm leading-relaxed">
                {event.description}
              </p>
            )}
            {event.location && (
              <p className="font-[family-name:var(--font-source-serif)] text-[var(--text-muted)] text-sm mt-1">
                📍 {event.location}
              </p>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
```

**Step 2: Commit**

```bash
git add components/TimelineEvent.tsx
git commit -m "add TimelineEvent component"
```

---

## Task 4: Create Timeline Component

**Files:**
- Create: `components/Timeline.tsx`

**Step 1: Write the Timeline component**

```tsx
'use client'

import { useState } from 'react'
import TimelineEvent from './TimelineEvent'

type Event = {
  id: string
  title: string
  description: string | null
  location: string | null
  starts_at: string
  ends_at: string | null
  event_type: 'activity' | 'meal' | 'travel' | 'free'
}

type Props = {
  events: Event[]
}

function groupEventsByDay(events: Event[]): Map<string, Event[]> {
  const groups = new Map<string, Event[]>()
  
  for (const event of events) {
    const date = new Date(event.starts_at)
    const dayKey = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Los_Angeles',
    })
    
    if (!groups.has(dayKey)) {
      groups.set(dayKey, [])
    }
    groups.get(dayKey)!.push(event)
  }
  
  return groups
}

export default function Timeline({ events }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  const groupedEvents = groupEventsByDay(events)
  
  return (
    <div className="space-y-8">
      {Array.from(groupedEvents.entries()).map(([day, dayEvents]) => (
        <section key={day}>
          <h2 className="font-[family-name:var(--font-playfair)] font-black text-xl uppercase tracking-wider text-[var(--text-primary)] mb-4">
            {day}
          </h2>
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isExpanded={expandedId === event.id}
                onToggle={() => setExpandedId(expandedId === event.id ? null : event.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/Timeline.tsx
git commit -m "add Timeline component with day grouping"
```

---

## Task 5: Create Schedule Page

**Files:**
- Create: `app/schedule/page.tsx`

**Step 1: Write the schedule page**

```tsx
import Timeline from '@/components/Timeline'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function SchedulePage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true })
  
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-[family-name:var(--font-playfair)] font-black text-3xl text-[var(--text-primary)] mb-8">
            Schedule
          </h1>
          <p className="text-[var(--text-muted)]">
            Unable to load events. Please try again later.
          </p>
        </div>
      </div>
    )
  }
  
  if (!events || events.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-[family-name:var(--font-playfair)] font-black text-3xl text-[var(--text-primary)] mb-8">
            Schedule
          </h1>
          <p className="text-[var(--text-muted)]">
            No events scheduled yet.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4">
      <div className="max-w-[680px] mx-auto">
        <h1 className="font-[family-name:var(--font-playfair)] font-black text-3xl text-[var(--text-primary)] mb-8">
          Schedule
        </h1>
        <Timeline events={events} />
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/schedule/page.tsx
git commit -m "add schedule page with timeline"
```

---

## Task 6: Update CSS Variables for Theme

**Files:**
- Modify: `app/globals.css`

**Step 1: Add CSS variables for the design system**

Ensure the globals.css has the CSS variables defined:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #F5F0E8;
  --bg-secondary: #EDE6D6;
  --bg-card: #FAF7F2;
  --text-primary: #1C1A16;
  --text-secondary: #5C5340;
  --text-muted: #8C7E6A;
  --accent-primary: #3D5A3E;
  --accent-secondary: #7A9E7E;
  --accent-warm: #A0522D;
  --accent-gold: #C8962E;
  --border: #D4C9B0;
  --shadow: rgba(28, 26, 22, 0.12);
}

[data-theme="dark"] {
  --bg-primary: #1A1814;
  --bg-secondary: #232018;
  --bg-card: #2A2620;
  --text-primary: #F0EBE0;
  --text-secondary: #C4B99A;
  --text-muted: #8C7E6A;
  --accent-primary: #7A9E7E;
  --accent-secondary: #3D5A3E;
  --accent-warm: #C47A4A;
  --accent-gold: #D4A84B;
  --border: #3A342A;
  --shadow: rgba(0, 0, 0, 0.4);
}

* {
  transition: background-color 300ms ease, color 300ms ease, border-color 300ms ease;
}
```

**Step 2: Commit**

```bash
git add app/globals.css
git commit -m "add CSS variables for theme system"
```

---

## Task 7: Run Build and Verify

**Step 1: Run typecheck**

```bash
npm run typecheck
```

Expected: No errors

**Step 2: Run lint**

```bash
npm run lint
```

Expected: No errors

**Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds

**Step 4: Final commit if any fixes needed**

If there were any type errors or lint issues that needed fixing:

```bash
git add -A
git commit -m "fix build errors"
```

---

## Summary

This plan creates:
1. Server-side Supabase client helper
2. Event type definition
3. TimelineEvent component (expandable, color-coded)
4. Timeline component (day grouping)
5. Schedule page (data fetching, error/empty states)
6. CSS variables for theming

Each task follows TDD principles where applicable, with frequent commits and verification steps.
