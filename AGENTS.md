# AGENTS.md

> Instructions for AI coding agents working in this repository.

---

## Project Overview

A web app for managing a group trip to Bend, OR. Features include:
- Interactive schedule/timeline
- Expense splitting
- Collaborative grocery list
- Game rules viewer
- Airbnb document viewer

**Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Supabase, Vercel

---

## Commands

### Development
```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build (run before merging)
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

### Testing
```bash
npm run test                         # Run all tests
npm run test -- --grep "test name"   # Run specific test by name
npm run test -- path/to/file.test.ts # Run tests in specific file
```

### Database
```bash
npx supabase db push            # Push local migrations to remote
npx supabase db pull            # Pull remote schema to local
npx supabase migration new name # Create new migration file
```

---

## Code Style

### Imports

Order imports (separated by blank lines):
1. React/Next.js imports
2. Third-party libraries
3. Supabase client and types
4. Internal components (use `@/` alias)
5. Internal utilities and hooks
6. Types

### Formatting

- **Tailwind CSS only** - no CSS modules or styled-components
- **Prettier** for formatting
- **No semicolons**
- **Single quotes** for strings
- **Trailing commas** in multiline structures

### TypeScript

- **Strict mode** enabled
- Explicit return types for exported functions
- Use `type` for object types, `interface` for extension
- Avoid `any` - use `unknown` when type is unknown
- Prefer discriminated unions for state management

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ExpenseCard.tsx` |
| Utilities | camelCase | `formatCurrency.ts` |
| Hooks | camelCase with `use` prefix | `useExpenses.ts` |
| Types | PascalCase | `Expense`, `Person` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_ITEMS_PER_PAGE` |
| Database tables | snake_case | `expense_splits` |
| API routes | kebab-case | `/api/expense-splits/route.ts` |

### File Structure

```
/app/[route]/page.tsx           # Page components
/app/[route]/layout.tsx         # Layout wrappers
/app/api/[route]/route.ts       # API route handlers
/components/component-name.tsx  # Reusable components
/lib/util-name.ts               # Utility functions
/lib/supabase/                  # Supabase client and helpers
/hooks/hook-name.ts             # React hooks
/types/type-name.ts             # Shared types
```

---

## Supabase Conventions

### Schema

- **Never modify production directly** - always use migrations
- Primary keys: `uuid` with `gen_random_uuid()`
- Timestamps: `created_at timestamptz default now()`
- **RLS enabled on all tables**

### Client Usage

```typescript
// Client components
import { createClient } from '@/lib/supabase/client'

// Server components/API routes
import { createServerClient } from '@/lib/supabase/server'
```

### Data Handling

- **Monetary values**: Store as integers (cents), format for display
- **Dates/times**: Store as UTC, display in `America/Los_Angeles`
- **Realtime**: Only `grocery_items` table needs realtime subscriptions

---

## Component Patterns

- Default to **Server Components** for pages
- Use `'use client'` only when needed: event handlers, hooks, browser APIs, realtime subscriptions

---

## Error Handling

```typescript
// API Routes
export async function GET(request: Request) {
  try {
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Client Components
try {
  await someAsyncOperation()
} catch (err) {
  setError(err instanceof Error ? err.message : 'Something went wrong')
}
```

---

## Git Workflow

1. **Never commit directly to `main`** - use feature branches
2. Run `npm run build` before merging
3. Commit messages: imperative mood, lowercase, no period (e.g., `add expense splitting feature`)

---

## Design System

- **Colors**: Pacific Northwest palette - Forest green `#2D6A4F`, Slate blue `#457B9D`, Warm off-white `#F1FAEE`
- Use Tailwind's default spacing scale
- Mobile-first responsive design

---

## People on Trip

Reference these names in expense/grocery features:
- Haleigh Schwartz, Liz Kaniecki, Mike, Evan Watson
- Jane Liggett, Mack Peters, Bretten Farrell
- Noelle Arneburg, Simon Arneburg, Zani Moore
