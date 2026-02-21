# Auth & Identity System Design

> Approved: 2026-02-21

## Overview

Simple PIN-based authentication with identity picker for a shared trip app. No individual accounts — everyone uses the same PIN, then selects their identity from a list.

---

## Architecture

```
/login (enter PIN)
    ↓ [valid PIN → set cookie]
    ↓
    └─→ localStorage has bend_person_id?
        ├─ YES → / (home)
        └─ NO  → /identify (who are you?)
                     ↓ [select person → save to localStorage]
                     └─→ / (home)
```

**Security layers:**
1. **Middleware** — checks `bend-session` cookie on every request (server-side)
2. **Client identity check** — checks `bend_person_id` in localStorage after login

---

## Components

### 1. Login Page (`/login`)

**UI:**
- Full-screen, centered form
- Playfair Display heading: "Bend 2026"
- 8 individual digit inputs (PIN is "epicshit") with auto-focus progression
- Forest green submit button
- Error state: shake animation + "Incorrect PIN" message
- Dark mode aware via CSS variables

**Behavior:**
- On submit → POST to `/api/auth`
- On success → check localStorage for existing `bend_person_id`:
  - If found → redirect to `/` (or `returnUrl`)
  - If not found → redirect to `/identify`
- On failure → show error, clear inputs

**Tech:**
- Client component (`'use client'`)
- Uses `useRouter` for navigation

**Implementation pattern:**
```typescript
// After successful API response:
const existingPersonId = localStorage.getItem('bend_person_id')
const destination = existingPersonId ? '/' : '/identify'
router.push(returnUrl || destination)
```

---

### 2. Auth API Route (`/api/auth/route.ts`)

**Request:** POST with `{ pin: string }`

**Flow:**
1. Fetch `passcode_hash` from `app_config` table (single row)
2. Compare entered PIN against bcrypt hash using `bcrypt.compare()`
3. If match → generate signed JWT, set `bend-session` cookie (httpOnly, secure, signed, maxAge: 30 days), return `{ success: true }`
4. If no match → return `{ error: 'Invalid PIN' }` with 401 status

**JWT payload:**
```typescript
{
  authenticated: true,
  iat: number,  // issued at timestamp
  exp: number   // expiration timestamp (30 days from now)
}
```

**Implementation pattern:**
```typescript
import { signSession } from '@/lib/auth'
import { cookies } from 'next/headers'

// After successful PIN verification:
const token = await signSession()
cookies().set('bend-session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30 // 30 days in seconds
})
```

**Cookie settings:**
- Name: `bend-session`
- Value: **signed JWT** (using `jose` library with HS256 algorithm)
- httpOnly: true (prevents XSS access)
- secure: true (production), false (dev)
- sameSite: 'lax'
- maxAge: 30 days (2592000 seconds)
- **Signing secret:** from `JWT_SECRET` environment variable (32+ char random string)

**Dependencies:**
- `bcrypt` (for comparing hashes)
- `jose` (for JWT signing/verification)

---

### 3. Middleware (`middleware.ts`)

**Logic:**
```
if (pathname === '/login') → allow through
if (pathname.startsWith('/api/auth')) → allow through
if (bend-session cookie exists AND signature is valid) → allow through
else → redirect to /login
```

**Implementation:**
- Checks for `bend-session` cookie existence
- **Verifies JWT signature** using `jose.jwtVerify()` with `JWT_SECRET`
- Checks token expiration (handled automatically by `jwtVerify`)
- On invalid/expired/missing token → redirect to `/login` with `returnUrl` query param
- Uses `verifySession()` helper from `/lib/auth.ts`

**Security:**
- JWT signature prevents cookie forgery
- Expiration prevents indefinite sessions
- httpOnly + secure flags prevent XSS/MITM attacks

---

### 4. Identity Picker (`/identify`)

**UI:**
- Full-screen, centered
- Playfair Display heading: "Who are you?"
- Grid of person cards (2 columns mobile, 3-4 desktop)
- Each card shows name with color as left border accent
- Hover/tap → subtle lift animation
- No skip option

**Behavior:**
- Fetch all people from Supabase on mount
- On selection → save to localStorage (`bend_person_id`, `bend_person_name`)
- Redirect to `/` (or `returnUrl`)

**Tech:**
- Client component
- Uses Supabase client from `/lib/supabase/client.ts`

---

### 5. `useIdentity()` Hook (`/lib/hooks/useIdentity.ts`)

**Returns:**
```typescript
{
  personId: string | null,
  personName: string | null,
  isIdentified: boolean,
  clearIdentity: () => void
}
```

**Behavior:**
- Reads from localStorage on mount
- Returns `isIdentified: false` if no identity set
- `clearIdentity()` removes both localStorage keys

---

## Seed Data

Default PIN: `epicshit`
- Hashed with bcrypt and stored in `app_config.passcode_hash`
- Migration file to insert the hash on first run

---

## Files to Create

| File | Purpose |
|------|---------|
| `app/login/page.tsx` | Login page UI |
| `app/identify/page.tsx` | Identity picker UI |
| `app/api/auth/route.ts` | Auth API endpoint |
| `middleware.ts` | Route protection with JWT verification |
| `lib/hooks/useIdentity.ts` | Identity hook |
| `supabase/migrations/..._seed_passcode.sql` | Seed default PIN hash |
| `lib/auth.ts` | Auth utilities: `signSession()`, `verifySession()` |

---

## `/lib/auth.ts` — JWT Utilities

**Required functions:**

```typescript
import { SignJWT, jwtVerify } from 'jose'

// Sign a new session token
export async function signSession(): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
  return token
}

// Verify a session token
export async function verifySession(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}
```

---

## Environment Variables

Add to `.env.local`:

```env
JWT_SECRET="[generate 32+ character random string]"
```

**Security notes:**
- NEVER commit `JWT_SECRET` to version control
- Use a cryptographically secure random string (e.g., `openssl rand -base64 32`)
- Rotate secret if compromised (will invalidate all sessions)
- Add `JWT_SECRET=` placeholder to `.env.example` with instructions

---

## Dependencies to Add

- `bcrypt` — for PIN hash comparison
- `jose` — for JWT signing and verification (already included in Next.js)
