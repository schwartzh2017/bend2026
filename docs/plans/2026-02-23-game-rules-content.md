# Design: Winter House Olympics — Game Rules Content

**Date:** 2026-02-23
**Status:** Approved

## Goal

Populate the `/rules` page with the full Winter House Olympics rulebook, formatted as Markdown and stored in the `documents` table under `doc_type = 'game_rules'`.

## Approach

Write a new migration file that UPDATEs the existing `game_rules` row. This follows the project convention of never editing prod directly and maintains migration history.

## Implementation

**File:** `supabase/migrations/20260223000001_update_game_rules_content.sql`

```sql
UPDATE documents
SET content = '<full markdown rulebook>',
    updated_at = now()
WHERE doc_type = 'game_rules';
```

## Markdown Structure

- `# Winter House Olympics` — h1 title with italic tagline
- `## Overview`
- `## The Teams`
- `## Opening Ceremony`
- `## Medal & Point System`
- `## The Events` — 10 `###` subsections with emoji headers
- `## General Rules`
- `## Sunday Morning Award Ceremony`
- `### Special Awards` — GFM table with Award / Description columns

## Rendering

The existing `MarkdownDocument` component handles all Markdown elements: h1–h3, paragraphs, lists, blockquotes, horizontal rules, and GFM tables. No frontend changes needed.
