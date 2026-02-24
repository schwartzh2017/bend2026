# Bend 2026 🏔️

A private trip companion app built for a group of friends heading to Bend, Oregon. Built as a personal experiment in modern AI-assisted development — every tool in the stack was chosen deliberately, and the workflow was designed to maximize parallel output while maintaining code quality.

---

## Features

- **Schedule** — Visual timeline of trip events, color-coded by type
- **Expenses** — Proportional split tracking (lodging by nights stayed, everything else by participation), net balance view, simplified settlement calculator showing who pays who (along with checkboxs to keep track of when payments were sent/recieved)
- **Grocery List** — Collaborative list grouped by category with per-person requests
- **Documents** — Airbnb host info and trip documents rendered as a reading experience
- **Game Rules** — House rules for the game we're playing
- **Auth** — Shared PIN access with per-person identity selection (no individual accounts, though users select who they are with the first login. The password + chosen identity is saved in browswer cache for 30 days) 
- **Settings** — Page to enter preferred payment method + username. Edit-access only enabled for selected user
- **Home Page** - Personalized home page showing "Your Balance" (who owes you what amounts, how much you owe others) + "Your Secret Assignment"
- **Personalized Secret Assignments** - Each person was given a unique task they must accomplish on the trip. This assignment was hidden until the first day of the trip, and had a show/hide toggle (default hide) once the assignment did appear on their home screen

---

## Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend | Next.js 15 (App Router, TypeScript, Tailwind CSS v4) | Free |
| Database | Supabase (Postgres + Auth + Storage + RLS) | Free tier |
| Deployment | Vercel | Free tier |
| Version Control | GitHub | Free |
| Terminal | Ghostty | Free |

---

## AI-Assisted Development Workflow

This project was built using a multi-agent workflow where different AI tools handled different roles simultaneously. The goal was to treat AI agents like a small team rather than a single assistant. Tips + ideas were taken from this [blog](https://interworks.com/blog/2026/02/11/get-work-done-with-claude-code-an-intro-to-using-agents/).

### Tools Used

| Tool | Role | Cost |
|---|---|---|
| Claude.ai | Planning, prompting strategy, skill authoring | Pro |
| Claude Code | Code review, edge case detection, code simplification | Pro |
| OpenCode | Primary code implementation | Free |
| Anthropic Skills & Plugins | Reusable instruction sets and agents | Free (open source) |

### The Workflow

**Phase 1 — Project Setup (Claude.ai)**

Before writing a single line of app code, Claude.ai was used to design the entire project architecture, write the initial `CLAUDE.md`, and author three custom skill files that would guide every subsequent AI session:

- `skills/frontend-design.md` — PNW outdoors aesthetic, Tenor Sans + Libre Baskerville typography, earth tone color system, mobile-first layout rules
- `skills/supabase-patterns.md` — Schema reference, RLS conventions, query patterns, the proportional expense split model
- `skills/expense-logic.md` — Split calculation logic, edge cases, settlement UI behavior, permissions model

These skill files acted as persistent, version-controlled memory that every agent loaded at the start of each session. They compound over time — the more specific they are, the less Claude has to re-discover conventions on each session.

**Phase 2 — Anthropic Open-Source Skills & Plugins**

Additional skills were cloned directly from Anthropic's open-source repositories and added to the project:

- [`algorithmic-art`](https://github.com/anthropics/skills) — Generative art with p5.js
- [`webapp-testing`](https://github.com/anthropics/skills) — Playwright-based UI testing
- [`skill-creator`](https://github.com/anthropics/skills) — Meta-skill for creating new skills
- [`code-simplifier`](https://github.com/anthropics/claude-plugins-official) — Claude Code plugin agent for post-implementation cleanup

**Phase 3 — Parallel Implementation (OpenCode + Claude Code)**

Each feature was built in its own git worktree so multiple agents could work simultaneously without stepping on each other + to not overwhelm the context:

For example:
```
git worktree add ../bend-schedule feature/schedule
git worktree add ../bend-expenses feature/expenses
git worktree add ../bend-grocery feature/grocery
```

Two separate contexts ran in parallel for each feature:

1. **OpenCode Big Pickle** — Used plan mode first (generating a plan file in `/plan`), then switched to implementation. OpenCode handled all code generation — components, API routes, Supabase queries, migrations.

2. **Claude Code** — Ran in a separate terminal session reviewing OpenCode's output. Each review session loaded the relevant skill files and checked for edge cases, schema deviations, design inconsistencies, TypeScript errors, and security issues. The code-simplifier agent then ran a final cleanup pass on all changed files.

Once Claude Code finished reviewing and fixing, the feature branch was merged to main and Vercel auto-deployed.

**Phase 4 — Iterative CLAUDE.md**

The `CLAUDE.md` was treated as a living document throughout the build. When any agent made a mistake or a new convention was established, the lesson was captured immediately:

> "Update CLAUDE.md so you don't make this mistake again."

However, recent [research](https://arxiv.org/abs/2602.11988) showed this may not be as necessary as previously thought.

### Why This Workflow Works

The key insight is **separation of concerns between agents**. OpenCode is fast and generative — it writes a lot of code quickly. Claude Code is critical and thorough — it finds what OpenCode missed. Neither agent is asked to do both jobs at once, which keeps context windows clean and outputs higher quality.

Running them in parallel via git worktrees meant a feature was never blocked waiting for review — while Claude Code checked the schedule, OpenCode was already building expenses. At peak, there were 7 OpenCode sessions and 3 Claude Code sessions running simultaneously across different feature branches.

The skill files are what make parallel sessions coherent. Without them, each session would rediscover conventions from scratch. With them, every agent starts with the same shared understanding of how this specific project works.

---

## Database Schema

| Table | Purpose |
|---|---|
| `people` | Trip participants with display colors and payment handles |
| `events` | Schedule items with start/end times and event type |
| `expenses` | Individual expenses with payer and category and how the expense will be divied up (and among who)|
| `expense_participants` | Who participated in each expense + nights (for lodging) |
| `grocery_items` | Collaborative grocery list with categories |
| `documents` | Trip documents (Airbnb info, game rules) |
| `app_config` | Single-row config: hashed PIN, trip dates |
| `settlements` | Payment confirmation tracking (sent + received checkboxes) |

All monetary values stored as **integer cents** — never floats. All times stored as **UTC**, displayed in `America/Los_Angeles`.

---

## Expense Split Logic

This app uses a **proportional participation model** rather than simple even splits:

**Standard split** — Cost divided evenly among only the people who participated (checkboxes to select who participated in what expense items- If you didn't go to dinner, you don't pay for dinner).

**Lodging split** — Cost divided by total person-nights, then multiplied by each person's nights. Someone staying 2 nights pays exactly half of what someone staying 4 nights pays.

**Settlement** — Balances are simplified to the minimum number of transactions needed to settle all debts using a greedy algorithm. Net balances shown first, then simplified payment instructions.

---

## Lessons Learned

A few things that tripped us up that might help others:

- **`proxy.ts` not `middleware.ts`** — This version of Next.js uses `proxy.ts` as the route protection file convention. Renaming it to `middleware.ts` breaks Vercel deployment with cryptic chunk loading errors.
- **All env vars must be in Vercel** — Every variable in `.env.local` needs to be manually added in Vercel's dashboard. 
- **Skills before code** — Writing the skill files before building anything was the right call. They paid for themselves immediately by keeping parallel sessions consistent.
- **Plan mode first, always** — Every OpenCode session started with plan mode before implementation. Reviewing the plan before saying yes caught scope issues and wrong assumptions before any code was written.
- **CLAUDE.md compounds** — The project memory file gets meaningfully better with every session. Updating it immediately when something goes wrong is the highest-ROI habit in this entire workflow.

---

## Steps for Running Locally

```bash
git clone https://github.com/yourusername/bend2026.git
cd bend2026
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

Enjoy 👻
