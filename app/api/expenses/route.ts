import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Expense, ExpenseParticipant, Person } from '@/lib/supabase/types'

type ExpenseWithRelations = Expense & {
  paid_by: Person
  expense_participants: (ExpenseParticipant & { person: Person })[]
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        paid_by:people(*),
        expense_participants(
          *,
          person:people(*)
        )
      `)
      .order('date', { ascending: false })

    if (error) {
      console.error('Failed to fetch expenses:', error.message)
      return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
    }

    const typedData = data as ExpenseWithRelations[]
    return NextResponse.json({ data: typedData })
  } catch (error) {
    console.error('Expenses fetch error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

type CreateExpenseRequest = {
  title: string
  description?: string
  amount_cents: number
  paid_by: string
  category: string
  date: string
  is_lodging: boolean
  participants: {
    person_id: string
    nights?: number
  }[]
}

export async function POST(request: Request) {
  try {
    const body: CreateExpenseRequest = await request.json()

    if (!body.title || !body.amount_cents || !body.paid_by || !body.participants?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (body.amount_cents < 1) {
      return NextResponse.json({ error: 'Amount must be at least $0.01' }, { status: 400 })
    }

    if (body.is_lodging) {
      const invalidNights = body.participants.some((p) => !p.nights || p.nights < 1)
      if (invalidNights) {
        return NextResponse.json({ error: 'All lodging participants must have nights > 0' }, { status: 400 })
      }
    }

    const supabase = await createServerSupabaseClient()

    const expenseInsert = {
      title: body.title,
      description: body.description || null,
      amount_cents: body.amount_cents,
      paid_by: body.paid_by,
      category: body.category || 'general',
      date: body.date || new Date().toISOString().split('T')[0],
    }

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert(expenseInsert as never)
      .select()
      .single()

    const typedExpense = expense as Expense | null

    if (expenseError || !typedExpense) {
      console.error('Failed to create expense:', expenseError?.message)
      return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
    }

    const participantsToInsert = body.participants.map((p) => ({
      expense_id: typedExpense.id,
      person_id: p.person_id,
      nights: body.is_lodging ? p.nights : null,
    }))

    const { error: participantsError } = await supabase
      .from('expense_participants')
      .insert(participantsToInsert as never[])

    if (participantsError) {
      await supabase.from('expenses').delete().eq('id', typedExpense.id)
      console.error('Failed to create participants:', participantsError.message)
      return NextResponse.json({ error: 'Failed to create expense participants' }, { status: 500 })
    }

    const { data: fullExpense, error: fetchError } = await supabase
      .from('expenses')
      .select(`
        *,
        paid_by:people(*),
        expense_participants(
          *,
          person:people(*)
        )
      `)
      .eq('id', typedExpense.id)
      .single()

    if (fetchError || !fullExpense) {
      return NextResponse.json({ data: typedExpense })
    }

    const typedFullExpense = fullExpense as ExpenseWithRelations
    return NextResponse.json({ data: typedFullExpense })
  } catch (error) {
    console.error('Expense creation error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
