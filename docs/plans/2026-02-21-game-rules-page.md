# Game Rules Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a /rules page that fetches and beautifully renders the game rules document stored in the database.

**Architecture:** Server Component that fetches a single document (doc_type='game_rules') from Supabase and renders markdown using react-markdown. Follows the PNW design aesthetic from frontend-design skill with Tenor Sans headings, Libre Baskerville body text, and warm earth tones.

**Tech Stack:** Next.js 14 (App Router), Supabase, react-markdown, remark-gfm, Tailwind CSS

---

## Task 1: Setup Git Worktree

**Files:**
- Create: `.opencode/worktrees/rules-page/` (worktree directory)

**Step 1: Create worktree (already done)**

The worktree already exists at `.opencode/worktrees/rules-page` on branch `feature/rules-page`.

**Step 2: Navigate to worktree for implementation**

Run: `cd .opencode/worktrees/rules-page`

---

## Task 2: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install react-markdown and remark-gfm**

Run: `npm install react-markdown remark-gfm`

**Step 2: Verify installation**

Run: `npm list react-markdown remark-gfm`
Expected: Shows installed versions

**Step 3: Commit dependencies**

Run: `git add package.json package-lock.json && git commit -m "add react-markdown and remark-gfm dependencies"`

---

## Task 3: Create Placeholder Document in Database

**Files:**
- Create: `supabase/seed_game_rules.sql`

**Step 1: Create seed SQL file**

Create: `supabase/seed_game_rules.sql`

```sql
INSERT INTO documents (id, title, doc_type, content, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Game Rules',
  'game_rules',
  '# Game Rules

## Overview

Welcome to our game! The rules will be added here once we decide what we're playing.

## Getting Started

Stay tuned for the full rulebook. In the meantime, here's what we know:

- We're going to have a great time
- The game will be easy to learn
- Everyone can participate

## Scoring

Scoring details coming soon!

## Tips

1. Have fun
2. Play fair
3. Enjoy the company

> "The best game is the one played with friends."

*Check back later for the complete rules!*',
  now(),
  now()
)
ON CONFLICT DO NOTHING;
```

**Step 2: Run seed file locally**

Run: `npx supabase db push`
Expected: Document inserted successfully

**Step 3: Commit seed file**

Run: `git add supabase/seed_game_rules.sql && git commit -m "add seed data for game rules document"`

---

## Task 4: Create /rules Page Component

**Files:**
- Create: `app/rules/page.tsx`

**Step 1: Create page component**

Create: `app/rules/page.tsx`

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default async function RulesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('doc_type', 'game_rules')
    .single()

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-[family-name:var(--font-tenor)] text-3xl text-[var(--text-primary)] mb-8">
            Game Rules
          </h1>
          <p className="text-[var(--text-muted)] font-[family-name:var(--font-libre)]">
            Unable to load game rules. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-[family-name:var(--font-tenor)] text-3xl text-[var(--text-primary)] mb-8">
            Game Rules
          </h1>
          <p className="text-[var(--text-muted)] font-[family-name:var(--font-libre)]">
            No game rules have been added yet. Check back soon!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4">
      <div className="max-w-[680px] mx-auto">
        <h1 className="font-[family-name:var(--font-tenor)] text-3xl text-[var(--text-primary)] mb-8">
          {document.title}
        </h1>
        <article className="prose prose-lg max-w-[65ch]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="font-[family-name:var(--font-tenor)] text-xl text-[var(--text-primary)] mb-4 mt-8">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-[family-name:var(--font-tenor)] text-lg text-[var(--text-primary)] mb-3 mt-6">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="font-[family-name:var(--font-libre)] text-base text-[var(--text-secondary)] mb-4 leading-[1.7]">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="font-[family-name:var(--font-libre)] pl-6 mb-4 space-y-2 text-[var(--text-secondary)]">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="font-[family-name:var(--font-libre)] pl-6 mb-4 space-y-2 text-[var(--text-secondary)]">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-[var(--text-secondary)] leading-[1.7]">
                  {children}
                </li>
              ),
              code: ({ className, children }) => {
                const isInline = !className
                if (isInline) {
                  return (
                    <code className="font-[family-name:var(--font-jetbrains)] text-sm bg-[var(--bg-secondary)] px-1 rounded-sm">
                      {children}
                    </code>
                  )
                }
                return (
                  <code className="font-[family-name:var(--font-jetbrains)] text-sm block bg-[var(--bg-secondary)] p-4 overflow-x-auto">
                    {children}
                  </code>
                )
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-[var(--accent-primary)] pl-4 italic text-[var(--text-muted)]">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-[var(--accent-primary)] underline hover:no-underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {document.content || ''}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
```

**Step 2: Verify file structure**

Run: `ls -la app/rules/`
Expected: Shows page.tsx file

**Step 3: Commit page component**

Run: `git add app/rules/page.tsx && git commit -m "create /rules page with markdown rendering"`

---

## Task 5: Update Navigation (if applicable)

**Files:**
- Modify: Navigation component location TBD

**Note:** This step depends on how navigation is implemented in the app. Check `app/layout.tsx` or a navigation component file.

**Step 1: Locate navigation component**

Run: `find components -name "*nav*" -o -name "*Nav*"`
Expected: Shows navigation component file

**Step 2: Add Rules link to navigation**

Based on the navigation component structure, add:
```typescript
<a href="/rules" className="[matching-nav-styles]">
  Rules
</a>
```

**Step 3: Test navigation**

Run: `npm run dev`
Manual test: Navigate to /rules via the nav link

**Step 4: Commit navigation update**

Run: `git add [nav-component-file] && git commit -m "add rules link to navigation"`

---

## Task 6: Test the Page

**Step 1: Start development server**

Run: `npm run dev`

**Step 2: Visit page in browser**

Navigate to: `http://localhost:3000/rules`
Expected: 
- Page loads without errors
- Title displays as "Game Rules"
- Markdown renders with proper typography
- Tenor Sans for headings, Libre Baskerville for body
- Colors match design system

**Step 3: Test error states**

Manual test: Temporarily break the database query, verify error message displays
Manual test: Remove the document, verify empty state displays

**Step 4: Test responsive design**

Manual test: Resize browser to mobile width (390px)
Expected: Layout adjusts properly, content readable

---

## Task 7: Run Build & Type Check

**Step 1: Run TypeScript type check**

Run: `npm run typecheck`
Expected: No type errors

**Step 2: Run linter**

Run: `npm run lint`
Expected: No lint errors

**Step 3: Run production build**

Run: `npm run build`
Expected: Build completes successfully

**Step 4: Commit if any fixes were needed**

Run: `git add . && git commit -m "fix type and lint errors"`

---

## Task 8: Update Documentation

**Files:**
- Modify: `CLAUDE.md` (optional)

**Step 1: Document the new page (if needed)**

If CLAUDE.md tracks features, add:
```markdown
- **Game Rules** — `/rules` displays markdown game rules from database
```

**Step 2: Commit documentation**

Run: `git add CLAUDE.md && git commit -m "document game rules page in CLAUDE.md"`

---

## Task 9: Push and Create Pull Request

**Step 1: Push branch to remote**

Run: `git push -u origin feature/rules-page`

**Step 2: Create pull request**

Run: `gh pr create --title "Add game rules page" --body "## Summary

- Adds /rules page that fetches game rules document from database
- Renders markdown with PNW design aesthetic
- Uses react-markdown with custom component styling
- Includes error and empty states
- Adds placeholder game rules content

## Testing

- [x] Page loads successfully
- [x] Markdown renders correctly
- [x] Typography matches design system
- [x] Responsive on mobile
- [x] Error states display properly
- [x] Type check passes
- [x] Lint passes
- [x] Production build succeeds"`

Expected: PR URL returned

---

## Post-Implementation

After PR is approved and merged:

1. **Clean up worktree:**
   ```bash
   cd /Users/hschwartz/Documents/repos/bend2026
   git worktree remove .opencode/worktrees/rules-page
   ```

2. **Update production database:**
   - Run seed file on production Supabase if needed

3. **Test on production:**
   - Visit live /rules page after deployment

---

**Plan complete!** This plan creates a beautiful, readable game rules page following the PNW design aesthetic with proper markdown rendering, error handling, and responsive design.
