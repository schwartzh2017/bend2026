import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'
import {
  calculateNetBalances,
  simplifyDebts,
  calculateExpenseShares,
  type ExpenseWithParticipants,
} from '@/lib/expenseLogic'
import SettlementClient from './SettlementClient'

export default async function SettlePage() {
  const supabase = await createServerSupabaseClient()

  const [{ data: expensesData }, { data: participantsData }, { data: peopleData }] = await Promise.all([
    supabase.from('expenses').select('*').order('date', { ascending: false }),
    supabase.from('expense_participants').select('*'),
    supabase.from('people').select('*'),
  ])

  if (!expensesData || !participantsData || !peopleData) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <p className="text-[var(--text-muted)]">Unable to load settlement data.</p>
      </div>
    )
  }

  const expenses: Tables<'expenses'>[] = expensesData
  const participants: Tables<'expense_participants'>[] = participantsData
  const people: Tables<'people'>[] = peopleData

  const participantsByExpense = new Map<string, Tables<'expense_participants'>[]>()
  for (const p of participants) {
    const existing = participantsByExpense.get(p.expense_id) ?? []
    existing.push(p)
    participantsByExpense.set(p.expense_id, existing)
  }

  const expensesWithShares: ExpenseWithParticipants[] = expenses.map((expense) => {
    const expenseParticipants = participantsByExpense.get(expense.id) ?? []
    const isLodging = expenseParticipants.some((p) => p.nights !== null)

    const nightsMap = isLodging
      ? new Map(expenseParticipants.map((p) => [p.person_id, p.nights ?? 0]))
      : null

    const participantIds = expenseParticipants.map((p) => p.person_id)

    const shares = calculateExpenseShares(
      expense.amount_cents,
      participantIds,
      expense.paid_by,
      isLodging,
      nightsMap
    )

    return {
      id: expense.id,
      title: expense.title,
      amountCents: expense.amount_cents,
      paidBy: expense.paid_by,
      category: expense.category,
      date: expense.date,
      participants: shares,
    }
  })

  const personIds = people.map((p) => p.id)
  const balances = calculateNetBalances(expensesWithShares, personIds)
  const simplifiedTransactions = simplifyDebts(balances)

  const settlementData = {
    people: people.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      payment_method: p.payment_method,
      payment_handle: p.payment_handle,
    })),
    balances: balances.map((b) => ({
      personId: b.personId,
      amountCents: b.amountCents,
    })),
    simplifiedTransactions: simplifiedTransactions.map((t) => ({
      from: t.from,
      to: t.to,
      amountCents: t.amountCents,
    })),
    expenses: expensesWithShares.map((e) => ({
      id: e.id,
      title: e.title,
      amountCents: e.amountCents,
      paidBy: e.paidBy,
      category: e.category,
      date: e.date,
      participants: e.participants,
    })),
  }

  return <SettlementClient data={settlementData} />
}
