import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Person, Settlement, InsertTables } from '@/lib/supabase/types'
import {
  calculateExpenseShares,
  calculateNetBalances,
  simplifyDebts,
  type Transaction,
} from '@/lib/expenseLogic'

type ExpenseForCalc = {
  id: string
  title: string
  amount_cents: number
  paid_by: string
  category: string
  date: string
  expense_participants: { person_id: string; nights: number | null }[]
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('settlements')
      .select(`
        *,
        from_person:people!settlements_from_person_id_fkey(*),
        to_person:people!settlements_to_person_id_fkey(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch settlements:', error.message)
      return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 })
    }

    type SettlementWithPeople = Settlement & {
      from_person: Person
      to_person: Person
    }

    return NextResponse.json({ data: data as SettlementWithPeople[] })
  } catch (error) {
    console.error('Settlements fetch error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select(`*, expense_participants(*)`)
      .order('date', { ascending: false })

    if (expensesError) {
      console.error('Failed to fetch expenses:', expensesError.message)
      return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
    }

    const expenses = expensesData as ExpenseForCalc[]

    const { data: peopleData, error: peopleError } = await supabase
      .from('people')
      .select('*')

    if (peopleError) {
      console.error('Failed to fetch people:', peopleError.message)
      return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 })
    }

    const people = peopleData as Person[]
    const personIds = people.map((p) => p.id)

    const expensesWithShares = expenses.map((expense) => {
      const participantIds = expense.expense_participants.map((p) => p.person_id)
      const isLodging = expense.category === 'lodging'

      const nightsMap = new Map<string, number>()
      if (isLodging) {
        for (const p of expense.expense_participants) {
          if (p.nights !== null) {
            nightsMap.set(p.person_id, p.nights)
          }
        }
      }

      const shares = calculateExpenseShares(
        expense.amount_cents,
        participantIds,
        expense.paid_by,
        isLodging,
        isLodging ? nightsMap : null
      )

      return {
        id: expense.id,
        title: expense.title,
        amountCents: expense.amount_cents,
        paidBy: expense.paid_by,
        category: expense.category,
        date: expense.date,
        participants: shares.map((s) => ({
          personId: s.personId,
          amountCents: s.amountCents,
        })),
      }
    })

    const balances = calculateNetBalances(expensesWithShares, personIds)
    const simplifiedTransactions = simplifyDebts(balances)

    const { error: deleteError } = await supabase.from('settlements').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    if (deleteError) {
      console.error('Failed to clear old settlements:', deleteError.message)
      return NextResponse.json({ error: 'Failed to clear old settlements' }, { status: 500 })
    }

    if (simplifiedTransactions.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const settlementsToInsert = simplifiedTransactions.map((t: Transaction) => ({
      from_person_id: t.from,
      to_person_id: t.to,
      amount_cents: t.amountCents,
      sender_confirmed: false,
      receiver_confirmed: false,
    }))

    const { data: insertedSettlements, error: insertError } = await supabase
      .from('settlements')
      .insert(settlementsToInsert as never)
      .select(`
        *,
        from_person:people!settlements_from_person_id_fkey(*),
        to_person:people!settlements_to_person_id_fkey(*)
      `)

    if (insertError) {
      console.error('Failed to create settlements:', insertError.message)
      return NextResponse.json({ error: 'Failed to create settlements' }, { status: 500 })
    }

    type SettlementWithPeople = Settlement & {
      from_person: Person
      to_person: Person
    }

    return NextResponse.json({ data: insertedSettlements as SettlementWithPeople[] })
  } catch (error) {
    console.error('Settlements sync error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
