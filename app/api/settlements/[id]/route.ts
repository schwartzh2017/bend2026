import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createServerSupabaseClient()

    const updateData: { sender_confirmed?: boolean; receiver_confirmed?: boolean } = {}

    if (typeof body.sender_confirmed === 'boolean') {
      updateData.sender_confirmed = body.sender_confirmed
    }
    if (typeof body.receiver_confirmed === 'boolean') {
      updateData.receiver_confirmed = body.receiver_confirmed
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('settlements')
      .update(updateData as never)
      .eq('id', id)
      .select(`
        *,
        from_person:people!settlements_from_person_id_fkey(*),
        to_person:people!settlements_to_person_id_fkey(*)
      `)
      .single()

    if (error) {
      console.error('Failed to update settlement:', error.message)
      return NextResponse.json({ error: 'Failed to update settlement' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Settlement update error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
