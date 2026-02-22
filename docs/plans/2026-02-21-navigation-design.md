# Navigation Design

**Date:** 2026-02-21
**Status:** Approved, not yet implemented

---

## Overview

Mobile-first navigation with bottom tab bar on mobile and sidebar on desktop. Uses route groups to cleanly separate authenticated app pages from login/identify pages.

---

## File Structure

```
app/
├── (app)/                    # Route group for pages with navigation
│   ├── layout.tsx            # App layout with Nav component
│   ├── home/page.tsx         # Home page (created separately)
│   ├── schedule/page.tsx     # Moved from app/schedule/
│   ├── expenses/page.tsx     # Moved from app/expenses/
│   ├── expenses/settle/      # Moved from app/expenses/settle/
│   ├── grocery/page.tsx      # New placeholder
│   └── docs/page.tsx         # New placeholder
├── login/page.tsx            # Auth - no nav (unchanged)
├── identify/page.tsx         # Auth - no nav (unchanged)
├── layout.tsx                # Root layout (unchanged)
└── page.tsx                  # Updated to redirect to /home

components/
└── Nav.tsx                   # New navigation component (client)
```

---

## Navigation Items

| Tab | Route | Icon | Label |
|-----|-------|------|-------|
| Home | `/home` | House | HOME |
| Schedule | `/schedule` | Calendar | SCHEDULE |
| Expenses | `/expenses` | DollarSign | EXPENSES |
| Grocery | `/grocery` | ShoppingCart | GROCERY |
| Docs | `/docs` | FileText | DOCS |

---

## Component: Nav.tsx

### Type
Client component (uses `usePathname` for active state detection)

### Props
None — self-contained navigation

### Behavior

**Mobile (<768px):**
- Fixed position at bottom of viewport
- Full width, height 64px
- Background: `var(--bg-primary)`
- Top border: 1px solid `var(--border)`
- Horizontal flex container with 5 equal tabs
- Each tab: icon (24px) + label below
- Labels: Tenor Sans, uppercase, 0.06em letter-spacing, 10px font-size

**Desktop (>=768px):**
- Fixed position on left side
- Width: 200px
- Height: 100vh
- Background: `var(--bg-secondary)`
- Right border: 1px solid `var(--border)`
- Vertical flex container with tabs stacked
- Each tab: icon (20px) + label to the right
- Labels: Tenor Sans, uppercase, 0.06em letter-spacing, 12px font-size

### Active State

**Mobile:**
- Text/icon color: `var(--accent-primary)` (forest green)
- Top border: 3px solid `var(--accent-primary)`

**Desktop:**
- Text/icon color: `var(--accent-primary)` (forest green)
- Left border: 3px solid `var(--accent-primary)`
- Background: subtle `var(--bg-card)` tint

### Inactive State
- Text/icon color: `var(--text-muted)`
- No border accent

### Hover State
- Text/icon color: `var(--text-secondary)`
- Subtle background: `var(--bg-secondary)` (mobile) or `var(--bg-card)` (desktop)

---

## Component: (app)/layout.tsx

### Type
Server component

### Structure
```tsx
export default function AppLayout({ children }) {
  return (
    <>
      <Nav />
      <main className="md:ml-[200px] min-h-screen pb-16 md:pb-0">
        {children}
      </main>
    </>
  )
}
```

### Layout Calculations
- Mobile: `pb-16` (64px bottom padding for tab bar)
- Desktop: `ml-[200px]` (200px left margin for sidebar)

---

## Placeholder Pages

### /grocery
- Centered content
- Tenor Sans heading: "Grocery List"
- Libre Baskerville body: "Coming soon"
- Follows design system colors

### /docs
- Centered content
- Tenor Sans heading: "Documents"
- Libre Baskerville body: "Coming soon"
- Follows design system colors

---

## Redirect Update

### app/page.tsx
Update redirect from `/schedule` to `/home`:
```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/home')
}
```

---

## Icons (Inline SVG)

No external icon library. Use inline SVGs:

```tsx
const icons = {
  home: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  schedule: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  expenses: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  grocery: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  docs: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
}
```

---

## Design System Compliance

Per `skills/frontend-design.md`:
- Colors: Use CSS variables (`var(--accent-primary)`, etc.)
- Typography: Tenor Sans for labels, uppercase with 0.06em letter-spacing
- Border radius: 2px or none (avoid over-rounded corners)
- Mobile-first: Design for 390px viewport, enhance at 768px+
- No gratuitous animation: 200ms transitions for hover/active states only

---

## Testing Checklist

- [ ] All 5 tabs navigate to correct routes
- [ ] Active state shows forest green + border accent
- [ ] Mobile: bottom tab bar visible and fixed
- [ ] Desktop: sidebar visible and fixed
- [ ] Login/identify pages do NOT show navigation
- [ ] Content not obscured by nav (proper padding/margins)
- [ ] Dark mode: colors apply correctly
- [ ] Keyboard accessible (tab navigation works)
