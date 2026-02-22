import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { GroceryItem, Person } from '@/lib/supabase/types'

type GroceryItemWithPerson = GroceryItem & {
  requested_by: Person | null
}

type CreateGroceryItemRequest = {
  name: string
  category?: string
  quantity?: string
  requested_by?: string
  notes?: string
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('grocery_items')
      .select(`
        *,
        requested_by:people(*)
      `)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch grocery items:', error.message)
      return NextResponse.json({ error: 'Failed to fetch grocery items' }, { status: 500 })
    }

    const typedData = data as GroceryItemWithPerson[]
    return NextResponse.json({ data: typedData })
  } catch (error) {
    console.error('Grocery items fetch error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateGroceryItemRequest = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const insertData = {
      name: body.name.trim(),
      category: body.category || 'other',
      quantity: body.quantity?.trim() || null,
      requested_by: body.requested_by || null,
      notes: body.notes?.trim() || null,
      is_checked: false,
    }

    const { data, error } = await supabase
      .from('grocery_items')
      .insert(insertData as never)
      .select(`
        *,
        requested_by:people(*)
      `)
      .single()

    if (error) {
      console.error('Failed to create grocery item:', error.message)
      return NextResponse.json({ error: 'Failed to create grocery item' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Grocery item creation error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, is_checked } = body

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    if (typeof is_checked !== 'boolean') {
      return NextResponse.json({ error: 'is_checked must be a boolean' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('grocery_items')
      .update({ is_checked } as never)
      .eq('id', id)
      .select(`
        *,
        requested_by:people(*)
      `)
      .single()

    if (error) {
      console.error('Failed to update grocery item:', error.message)
      return NextResponse.json({ error: 'Failed to update grocery item' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Grocery item update error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
