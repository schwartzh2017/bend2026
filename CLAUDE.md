# CLAUDE.md — Bend Trip App

> This file is read by Claude Code on every session startup.  
> Update it whenever Claude makes a mistake or you establish a new pattern.  
> Commit changes frequently — this file gets smarter over time.

---

## Project Overview

A web app for a group trip to Bend, OR. Built by one developer (me), used by ~[X] friends.  
Stack: Next.js (App Router) + Supabase + Vercel. Managed via GitHub.

**Live URL:** [add when deployed]  
**Supabase Project:** [add project ref]  
**GitHub Repo:** [add URL]

---

## Features

1. **Interactive Schedule** — Visual timeline of trip events/activities
2. **Expense Splitter** — Track who paid what, calculate who owes who
3. **Grocery List** — Real-time collaborative list with categories
4. **Game Rules** — Display rules for the game(s) we're playing
5. **Airbnb Doc Viewer** — Display the host document (PDF/text)

---

## Architecture

- **Frontend:** Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (Postgres + Auth + Storage + Realtime)
- **Deployment:** Vercel (auto-deploys from `main` branch)
- **Terminal:** Ghostty
- **Agent Orchestration:** OpenCode + Claude Code

### Key File Structure
```
/app              → Next.js app router pages
/components       → Reusable React components  
/lib/supabase     → Supabase client + typed helpers
/skills           → Claude skill files (load as needed)
/supabase/migrations → All DB migrations (never edit prod directly)
```

---

## Supabase Conventions

- **Never** modify the production database schema directly — always write a migration file first
- All tables use `uuid` primary keys with `gen_random_uuid()` default
- All tables have `created_at timestamptz default now()`
- RLS (Row Level Security) is enabled on all tables — always write policies alongside table creation
- Use the typed Supabase client from `/lib/supabase/client.ts` — never import directly from `@supabase/supabase-js` in components
- Realtime is used for: `grocery_items` table only (keep realtime subscriptions minimal)

### Core Tables (do not restructure without updating this file)
- `people` — trip participants
- `events` — schedule items with start/end times
- `expenses` — who paid, how much, for what
- `expense_splits` — how each expense is divided among people
- `grocery_items` — item name, category, who requested it, checked off bool
- `documents` — metadata for uploaded docs (actual files in Supabase Storage)

---

## Frontend Conventions

- Use **Tailwind CSS** for all styling — no CSS modules, no inline styles
- Component files: PascalCase (`ExpenseCard.tsx`), utility files: camelCase (`formatCurrency.ts`)
- All monetary values stored as **integers (cents)** in the database — display layer handles formatting
- Date/times stored as UTC in DB, displayed in **America/Los_Angeles** timezone
- Design vibe: Pacific Northwest outdoors — forest greens (#2D6A4F), slate blue (#457B9D), warm off-white (#F1FAEE). Avoid generic "AI app" aesthetics. Load the `/skills/frontend-design.md` skill when building UI.

---

## Skills

Load these skill files at the start of relevant sessions:

| Skill File | When to Use |
|---|---|
| `/skills/frontend-design.md` | Any UI/component work |
| `/skills/supabase-patterns.md` | Any DB queries, schema changes, or RLS |
| `/skills/expense-logic.md` | Any work touching expenses or splits |

---

## How to Work in This Repo

### Starting a New Feature
1. Read this CLAUDE.md fully
2. Load relevant skill file(s)
3. Use **plan mode** first — don't write code until the plan is reviewed
4. Create a git worktree for the feature branch: `git worktree add ../bend-[feature] feature/[feature]`
5. Use subagents for heavy research tasks to keep context clean

### Committing
- Commit frequently with descriptive messages
- Never commit directly to `main` — use feature branches and PRs
- Run `npm run build` before merging to catch type errors

### When Claude Makes a Mistake
- Correct the mistake, then say: *"Update CLAUDE.md so you don't make this mistake again"*
- Claude will append a note to the **Lessons Learned** section below

---

## Prompt Patterns to Use

- **Planning:** "Use plan mode. Don't write code yet. Let's design [X] together."
- **Review:** "Grill me on this implementation until I can defend every decision."
- **Refinement:** "Knowing everything you know now, what's the more elegant solution here?"
- **Verification:** "Prove to me this works. Show me the output and explain the edge cases."
- **Parallel work:** "Use subagents for the research portion and return only the summary."

---

## Lessons Learned

> Claude: append mistakes and corrections here as they occur. Date each entry.

- **2026-02-22 — Next.js 16 proxy convention:** This project uses Next.js 16, which deprecated `middleware.ts` in favor of `proxy.ts`. The root file must be `proxy.ts` with `export async function proxy(...)`. Do NOT rename it back to `middleware.ts`. Next.js 16 will log a deprecation error if you use the old name.
- **2026-02-22 — proxy.ts requires a config matcher export:** `proxy.ts` MUST include `export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',] }`. Without this, the proxy intercepts `_next/static` asset requests on Vercel, returns an HTML redirect instead of JS, and causes `Unexpected token '<'` errors that break the entire app. Always include the matcher when editing proxy.ts.

---

## Out of Scope (Do Not Build)

- No user-generated accounts (access via shared link or simple auth)
- No payment processing (expense tracker is tracking only, not actual payments)
- No native mobile app (responsive web is sufficient)
- No admin dashboard

---

## Contacts / People on Trip

> Add names here so Claude can reference them in the expense/grocery features

- Haleigh Schwartz
- Liz Kaniecki
- Mike
- Evan Watson
- Jane Liggett
- Mack Peters
- Bretten Farrell
- Noelle Arneburg
- Simon Arneburg
- Zani Moore

## Nights each person spent
- Haleigh Schwartz: 3 nights
- Liz Kaniecki: 3 nights
- Mike: 3 nights
- Evan Watson: 2 nights
- Jane Liggett: 1 night
- Mack Peters: 3 nights
- Bretten Farrell: 3 nights
- Noelle Arneburg: 3 nights
- Simon Arneburg: 3 nights
- Zani Moore: 2 nights