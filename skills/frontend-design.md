---
name: frontend-design
description: >
  Design system and aesthetic guidelines for the Bend Trip App. Load this skill
  whenever building or modifying any UI component, page, or layout. Ensures all
  frontend work stays visually consistent, mobile-first, and true to the PNW
  outdoors aesthetic.
---

# Frontend Design Skill — Bend Trip App

This skill guides all frontend work for the Bend Trip App. Every interface built
for this project must feel like a beautiful field journal meets a bold art book —
earthy, rugged, typographically strong, and refreshingly uncluttered. This is NOT
a generic dashboard. It should feel like it was designed by someone who actually
goes outside.

---

## Aesthetic Direction

**Core vibe:** Pacific Northwest outdoors. Think trail maps, REI catalogs, national
park signage, a well-worn field notebook. Bold editorial choices with genuine
restraint — every element earns its place.

**Tone:** Artsy minimalism. Generous whitespace. Strong typographic hierarchy.
Occasional rugged texture. Nothing superfluous.

**Anti-patterns to avoid at all costs:**
- Generic "SaaS dashboard" look (blue gradients, rounded cards everywhere, Inter or Roboto font)
- Cluttered layouts with too many competing elements
- Pastel or overly bright color schemes
- Stock-photo vibes or corporate polish
- Anything that looks like it came from a UI kit without modification

---

## Color System

Use CSS variables for all colors. Both light and dark themes must be defined.

### Light Mode
```css
:root {
  --bg-primary: #F5F0E8;        /* warm parchment */
  --bg-secondary: #EDE6D6;      /* slightly darker parchment */
  --bg-card: #FAF7F2;           /* near-white warm */
  --text-primary: #1C1A16;      /* near-black warm */
  --text-secondary: #5C5340;    /* dark warm brown */
  --text-muted: #8C7E6A;        /* medium warm brown */
  --accent-primary: #3D5A3E;    /* deep forest green */
  --accent-secondary: #7A9E7E;  /* sage green */
  --accent-warm: #A0522D;       /* sienna brown */
  --accent-gold: #C8962E;       /* amber/gold */
  --border: #D4C9B0;            /* warm tan border */
  --shadow: rgba(28, 26, 22, 0.12);
}
```

### Dark Mode
```css
[data-theme="dark"] {
  --bg-primary: #1A1814;        /* deep warm black */
  --bg-secondary: #232018;      /* slightly lighter */
  --bg-card: #2A2620;           /* card background */
  --text-primary: #F0EBE0;      /* warm off-white */
  --text-secondary: #C4B99A;    /* warm tan */
  --text-muted: #8C7E6A;        /* medium warm brown */
  --accent-primary: #7A9E7E;    /* sage green (lighter in dark) */
  --accent-secondary: #3D5A3E;  /* deep forest (used as bg accent) */
  --accent-warm: #C47A4A;       /* sienna (brighter in dark) */
  --accent-gold: #D4A84B;       /* amber (brighter in dark) */
  --border: #3A342A;            /* subtle warm border */
  --shadow: rgba(0, 0, 0, 0.4);
}
```

**Color rules:**
- Never use pure black (#000) or pure white (#fff) — always use the warm variants
- The forest green (`--accent-primary`) is the primary action color in light mode
- Sage green (`--accent-secondary`) is for secondary actions and highlights
- Sienna and gold are for accents, alerts, and moments of delight — use sparingly
- Dominant color + one sharp accent per component. Never 3+ competing accent colors.

---

## Typography

### Font Pairing
- **Display / Headings:** `Tenor Sans` — elegant, refined, distinctive without being loud
- **Body / UI:** `Libre Baskerville` — warm, classic, optimized for screen readability
- **Monospace / Data:** `JetBrains Mono` — for amounts, times, codes

Load from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Tenor+Sans&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale
```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
--text-5xl: 3rem;
```

### Typography Rules
- Page titles use Tenor Sans — it has natural elegance at large sizes, no need to go ultra-heavy
- Tenor Sans for all navigation labels, section headers, and category titles
- Body text uses Libre Baskerville at regular (400) weight — highly readable at all sizes
- Italic Libre Baskerville for supporting text, captions, and decorative text moments
- Monetary amounts and times always use JetBrains Mono
- Line height for body: 1.7. Line height for display: 1.2
- Letter spacing on Tenor Sans uppercase labels: 0.06em
- Never bold Tenor Sans — its elegance comes from its single weight

---

## Layout & Spacing

**This app is mobile-first.** Design for a 390px viewport first, then enhance for
larger screens. Every component must be fully functional and beautiful on a phone.

### Spacing Scale (use consistently)
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px
```

### Layout Principles
- Generous padding — never cramped. Minimum 16px horizontal padding on mobile.
- Use asymmetry intentionally. Not every card needs to be the same width.
- Full-bleed sections for visual breathing room between features.
- The schedule view should feel like a timeline, not a table.
- Max content width: 680px on desktop, centered.

### Card Style
Cards should feel like torn journal pages or field notebook entries, not SaaS tiles:
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 2px; /* very subtle — avoid over-rounded corners */
  padding: 20px 24px;
  box-shadow: 2px 3px 12px var(--shadow);
}
```

---

## Motion & Animation

- Page load: staggered fade-up for list items (animation-delay: 0.05s per item)
- Navigation transitions: 200ms ease
- Theme toggle: 300ms smooth color transition on all CSS variables
- Hover states on interactive elements: subtle lift (translateY(-1px)) + shadow increase
- No gratuitous animation — motion should feel purposeful, like turning a page

```css
* { transition: background-color 300ms ease, color 300ms ease, border-color 300ms ease; }
```

---

## Component Conventions

### Navigation
- Bottom tab bar on mobile (thumb-friendly)
- Sidebar on desktop (>768px)
- Active state: forest green with left border accent

### Buttons
- Primary: forest green bg, warm off-white text, no border-radius or very subtle (2px)
- Secondary: transparent bg, forest green border and text
- Destructive: sienna color scheme
- All buttons: Tenor Sans, slightly tracked uppercase label, or natural case display

### Forms & Inputs
- Underline style inputs (no box) for a cleaner, more editorial feel
- Focus state: forest green underline, 2px
- Labels float above on focus (animated)

### Dark Mode Toggle
- Should be prominent and accessible — not hidden in a settings menu
- Place in top-right of header/nav
- Use a sun/moon icon with smooth transition

---

## Feature-Specific Design Notes

**Schedule View:** Think timeline, not calendar grid. Vertical flow. Time markers on
the left in JetBrains Mono. Event titles in Tenor Sans. Use forest green
left-border accent for current/active events.

**Expense Splitter:** Amounts always in JetBrains Mono. Who-owes-who should be
scannable at a glance — use color (green = owed to you, sienna = you owe) with clear
typographic hierarchy. Avoid table-heavy layouts.

**Grocery List:** Checkbox items with satisfying strike-through animation on check.
Group by category with bold Tenor Sans category headers.

**Game Rules & Airbnb Doc:** Treat these as reading experiences. Generous line height,
max 65ch width, comfortable body text. Not a wall of text — use bold headers and
section breaks.

---

## What "Production-Grade" Means for This Project

Every screen Claude builds must be:
- Fully functional on a 390px mobile viewport without horizontal scroll
- Accessible: sufficient color contrast in both light and dark modes (WCAG AA minimum)
- Consistent with the color system and type scale above — no one-off values
- Free of placeholder Lorem Ipsum — use realistic trip/Bend content in examples
- Responsive: gracefully enhanced at 768px+ breakpoints

---

## Quick Reference — Do / Don't

| Do | Don't |
|---|---|
| Tenor Sans for headings | Inter, Roboto, or system-ui for headings |
| Warm earth tones from the palette | Arbitrary hex values |
| 2px or no border-radius on cards | 12px+ rounded corners everywhere |
| Bold typographic hierarchy | Equal weight on everything |
| Generous whitespace | Cramped, dense layouts |
| Mobile layout first | Desktop-first then squeezed down |
| Purposeful subtle animation | Flashy transitions everywhere |