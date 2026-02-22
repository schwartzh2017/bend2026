# Documents Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build /docs page to display Airbnb host information as a beautiful reading experience.

**Architecture:** Server component + react-markdown + design system typography.

**Tech Stack:** Next.js App Router, Supabase, react-markdown

---

### Task 1: Install react-markdown

**Files:**
- Modify: `package.json`

**Step 1: Install react-markdown**

Run: `npm install react-markdown`

Expected: Package added successfully

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "add react-markdown dependency"
```

---

### Task 2: Create API route for documents

**Files:**
- Create: `app/api/documents/route.ts`

**Step 1: Create the API route**

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('doc_type', 'airbnb_info')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

**Step 2: Verify build passes**

Run: `npm run build`

Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/api/documents/route.ts
git commit -m "add documents api route"
```

---

### Task 3: Create seed migration with document content

**Files:**
- Create: `supabase/migrations/20260221100012_seed_airbnb_document.sql`

**Step 1: Create migration with formatted markdown**

```sql
INSERT INTO documents (title, doc_type, content)
VALUES (
  'The House at River''s Bend',
  'airbnb_info',
  '# The House at River''s Bend

**55026 Marten Lane, Bend, OR**

---

Haleigh & Friends,

Here are some instructions to make your stay a little easier.

## Access

**House key code** (to all doors including garage): `5126`

Check in anytime **Thursday, February 26**. Check out anytime **Sunday, March 1**. (We are not strict about times!)

## Heating

The house will be cold upon arrival. Here''s how to warm it up:

1. Turn living room heat to **69 degrees**
2. Turn on the gas fireplace — the switch is in the living room between the two sliders (left switch)
3. Head downstairs and turn on the heat (thermostat is in the hallway)
4. All bedrooms and the pool table area have portable heaters for quick warming

## Amenities

### Hot Tub
Set to 102° with fresh chemicals.

### Garage & Outdoor Gear
- **3 usable bikes** including 2 e-bikes
- Trekking poles and snowshoes in the garage cupboard (right of the fridge)

### Kitchen
Fully stocked with coffee pot, air fryer, Insta-Pot, griddle, and every type of pot & pan imaginable. Two fridges — one in the house, one in the garage.

### Entertainment
- Pool table and ping pong table (downstairs)
- TVs upstairs and downstairs with Netflix streaming
- **WiFi:** Select `Netgear 51` — password: `blacksky217`

### Bedrooms
3 king beds + 6 other beds throughout the house.

### Provided
Beach towels, bath towels, soap, shampoo, hairdryers. Medicine cabinet in the master bathroom has extra supplies.

---

## What to Bring

- Food
- Alcohol
- Coffee
- Cocoa

Basic items are in the house — feel free to use whatever you find!

---

## E-Bike Notes

The 2 e-bikes are in the garage. You can ride right out the back gate onto forest service roads and trails, or bike all the way to La Pine State Park.

**Rules:**
- E-bikes are **not allowed** on river trails (National Forest prohibits motorized vehicles)
- **Do not leave bikes plugged into chargers** when leaving the house — it''s unsafe

---

## Before You Leave

Please help with the following:

- Run the dishwasher
- Hang wet towels on hooks in the laundry room
- Strip sheets from beds you used and pile them on the bed
- Empty the fridge (both fridges)
- Empty all trash and pull can to end of driveway (pickup is Monday!)
- Excess trash/recycling can go in the garage
- Lock all doors by re-entering code `5126` and turning the deadbolt

*Please don''t stress about cleaning thoroughly — just these basics help a lot!*

---

## Shopping Nearby

| Location | Notes |
|----------|-------|
| Sun River Village | Closest, but very expensive |
| La Pine | Has Grocery Outlet + expensive grocery store |
| Bend | Best option — shop before heading to house |

---

## Contact

**Stacie & Joe Backus**

- Stacie: 503-866-8519
- Joe: 503-860-5557

*No question is too crazy — reach out if you need anything!*

---

Enjoy your stay! We finally have fresh snow!'
);
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260221100012_seed_airbnb_document.sql
git commit -m "add airbnb document seed migration"
```

---

### Task 4: Create docs page component

**Files:**
- Create: `app/docs/page.tsx`

**Step 1: Create the page component**

```typescript
import ReactMarkdown from 'react-markdown'

type Document = {
  id: string
  title: string
  doc_type: string
  content: string | null
  storage_path: string | null
}

async function getDocument(): Promise<Document | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/documents`, {
    cache: 'no-store'
  })
  
  if (!res.ok) return null
  
  const data = await res.json()
  return data.data
}

export default async function DocsPage() {
  const doc = await getDocument()

  if (!doc || !doc.content) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>No documents available yet.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <article 
        className="max-w-[65ch] mx-auto"
        style={{ color: 'var(--text-primary)' }}
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="font-[family-name:var(--font-tenor)] text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-[family-name:var(--font-tenor)] text-xl sm:text-2xl font-bold mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-[family-name:var(--font-tenor)] text-lg font-bold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-1 pl-2" style={{ color: 'var(--text-primary)' }}>
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-1 pl-2" style={{ color: 'var(--text-primary)' }}>
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {children}
              </strong>
            ),
            code: ({ children }) => (
              <code 
                className="font-[family-name:var(--font-jetbrains)] px-1.5 py-0.5 rounded text-sm"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent-primary)' }}
              >
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote 
                className="border-l-4 pl-4 italic my-4"
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--text-secondary)' }}
              >
                {children}
              </blockquote>
            ),
            hr: () => (
              <hr className="my-8" style={{ borderColor: 'var(--border)' }} />
            ),
            a: ({ href, children }) => (
              <a 
                href={href} 
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent-primary)' }}
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border-collapse" style={{ color: 'var(--text-primary)' }}>
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border px-4 py-2 text-left font-bold font-[family-name:var(--font-tenor)]" style={{ borderColor: 'var(--border)' }}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border px-4 py-2" style={{ borderColor: 'var(--border)' }}>
                {children}
              </td>
            ),
          }}
        >
          {doc.content}
        </ReactMarkdown>
      </article>
    </div>
  )
}
```

**Step 2: Verify build passes**

Run: `npm run build`

Expected: Build succeeds with /docs route

**Step 3: Commit**

```bash
git add app/docs/page.tsx
git commit -m "add documents page"
```

---

### Task 5: Run migration and verify

**Step 1: Push migration to Supabase**

Run: `npx supabase db push`

Expected: Migration applied successfully

**Step 2: Start dev server and verify**

Run: `npm run dev`

Expected: /docs loads with formatted content

**Step 3: Final commit (if any changes)**

```bash
git status
# If clean, no commit needed
```

---

## Summary

5 tasks, each bite-sized:
1. Install react-markdown
2. Create API route
3. Create seed migration
4. Create docs page
5. Run migration and verify
