import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { COOKIE_MAX_AGE_SECONDS } from '@/lib/constants'

type PersonData = { id: string; name: string }

export async function POST(request: Request) {
  try {
    const { personId, personName } = await request.json()

    if (!personId || typeof personId !== 'string') {
      return NextResponse.json({ error: 'personId is required' }, { status: 400 })
    }

    if (!personName || typeof personName !== 'string') {
      return NextResponse.json({ error: 'personName is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('people')
      .select('id, name')
      .eq('id', personId)
      .single()

    const person = data as PersonData | null

    if (error || !person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    if (person.name !== personName) {
      return NextResponse.json({ error: 'Person name mismatch' }, { status: 400 })
    }

    const cookieStore = await cookies()

    cookieStore.set('bend_person_id', personId, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE_SECONDS,
      path: '/',
    })

    cookieStore.set('bend_person_name', personName, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE_SECONDS,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Identify error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
