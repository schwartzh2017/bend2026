import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { signSession } from '@/lib/auth'
import { SESSION_COOKIE_NAME, COOKIE_MAX_AGE_SECONDS } from '@/lib/constants'

// Dummy hash for timing attack prevention
const DUMMY_HASH = '$2b$10$AAAAAAAAAAAAAAAAAAAAAA.BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()

    // Validate PIN format: must be exactly 8 lowercase letters
    if (!pin || typeof pin !== 'string' || !/^[a-z]{8}$/.test(pin)) {
      return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('app_config')
      .select('id, passcode_hash')
      .eq('id', 1)
      .maybeSingle()

    // Type assertion needed because Supabase's maybeSingle() has complex type inference
    type AppConfig = { id: number; passcode_hash: string }
    const configData = data as AppConfig | null

    // Always run bcrypt comparison to prevent timing attacks
    // Use dummy hash if data is missing to maintain consistent timing
    const hashToCompare = configData?.passcode_hash || DUMMY_HASH
    const isValid = await bcrypt.compare(pin, hashToCompare)

    // Check both database error and bcrypt result
    if (error || !configData || !isValid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    // Create session token
    const token = await signSession()
    const cookieStore = await cookies()

    // Set secure session cookie
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true, // Always use secure cookies
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: COOKIE_MAX_AGE_SECONDS,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log sanitized error (don't expose sensitive details)
    console.error('Auth error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
