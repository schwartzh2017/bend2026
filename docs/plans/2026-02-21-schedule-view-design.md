# Schedule View Design

**Date:** 2026-02-21
**Route:** `/schedule`

## Overview

A vertical timeline view displaying trip events grouped by day. Mobile-first, with editorial typography and Pacific Northwest color palette.

## Requirements

- Fetch all rows from `events` table
- Display as vertical timeline (not calendar grid)
- Time markers in JetBrains Mono on the left
- Event titles in Playfair Display italic
- Color-code by `event_type` field
- Mobile-first responsive design
- Inline expand for event details

## Data Layer

- Server component fetches events from Supabase
- Sort by `starts_at` ascending
- Group by day using `America/Los_Angeles` timezone

### Events Table Schema

```sql
events (
  id uuid,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  event_type text not null default 'activity', -- 'activity' | 'meal' | 'travel' | 'free'
  created_at timestamptz,
  updated_at timestamptz
)
```

### Event Types in Seed Data

- `travel` — arrival/departure events
- `activity` — planned activities (ski day, game night, etc.)
- `free` — unstructured time
- `meal` — (future use)

## Visual Design

### Layout Structure

```
┌────────────────────────────────────┐
│  Friday, February 27               │  ← Playfair Display 900
│                                    │
│  02:00 AM  ●───────────────────    │  ← JetBrains Mono time
│            Bretten, Simon... leave │  ← Playfair Display italic
│            for Bend                │
│                                    │
│  05:00 AM  ●───────────────────    │
│            Bretten, Simon... arrive│
│            [expanded details]      │  ← Source Serif 4
│                                    │
│  Saturday, February 28             │
│  ...                               │
└────────────────────────────────────┘
```

### Timeline Visual

- Left border accent (colored by event type)
- Dot marker at time position
- Subtle connecting line feel via border-left

### Color Coding

| event_type | Color | Usage |
|------------|-------|-------|
| `travel` | Sage green `#7A9E7E` | Border, dot, accent text |
| `activity` | Forest green `#3D5A3E` | Border, dot, accent text |
| `meal` | Sienna `#A0522D` | Border, dot, accent text |
| `free` | Muted brown `#8C7E6A` | Border, dot, accent text |

### Typography

- **Day headers:** Playfair Display 900, uppercase tracking
- **Time markers:** JetBrains Mono 400
- **Event titles:** Playfair Display italic 700
- **Expanded details:** Source Serif 4 400

## Components

### 1. SchedulePage (Server Component)

Location: `/app/schedule/page.tsx`

Responsibilities:
- Fetch all events from Supabase
- Pass data to Timeline client component
- Handle loading/error states

### 2. Timeline (Client Component)

Location: `/components/Timeline.tsx`

Responsibilities:
- Group events by day
- Render day headers
- Map events to TimelineEvent components
- Manage expanded state (single event at a time)

### 3. TimelineEvent (Client Component)

Location: `/components/TimelineEvent.tsx`

Responsibilities:
- Render time marker and event card
- Handle click to expand/collapse
- Display description and location when expanded
- Apply color coding based on event_type

## Interaction

- Click event → inline card expands smoothly
- Only one event expanded at a time
- Height transition: 200ms ease
- Expanded content shows: description, location (if available)

## Responsive Design

### Mobile (390px)
- Full width timeline
- 16px horizontal padding
- Time and title in vertical stack
- Touch-friendly tap targets (min 44px)

### Desktop (768px+)
- Max content width: 680px
- Centered
- Slightly larger time markers
- Hover state on events

## Error Handling

- If no events: show empty state message
- If fetch error: show error message with retry option

## Accessibility

- Sufficient color contrast (WCAG AA)
- Keyboard navigation for event expansion
- Focus states visible
- Semantic HTML (time elements, headings)
