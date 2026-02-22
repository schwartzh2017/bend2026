import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { UpdateTables } from '@/lib/supabase/types'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createServerSupabaseClient()

    const updateData: { payment_method?: string | null; payment_handle?: string | null } = {}

    if (body.payment_method !== undefined) {
      const validMethods = ['venmo', 'cashapp', 'zelle', null]
      if (body.payment_method !== null && !validMethods.includes(body.payment_method)) {
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
      }
      updateData.payment_method = body.payment_method
    }
    if (body.payment_handle !== undefined) {
      updateData.payment_handle = body.payment_handle || null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('people')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update person:', error.message)
      return NextResponse.json({ error: 'Failed to update person' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Person update error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
