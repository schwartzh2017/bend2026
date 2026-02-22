import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  calculateNetBalances,
  calculateExpenseShares,
  type ExpenseWithParticipants,
} from '@/lib/expenseLogic'
import type { Tables, Person } from '@/lib/supabase/types'

type GroceryItemWithPerson = Tables<'grocery_items'> & {
  requested_by: Person | null
}

export type HomePageData = {
  tripStartDate: string | null
  upcomingEvents: Tables<'events'>[]
  personId: string | null
  personName: string | null
  balanceCents: number | null
  recentGroceries: GroceryItemWithPerson[]
}

export async function getHomePageData(personId: string | null): Promise<HomePageData> {
  const supabase = await createServerSupabaseClient()

  // Always-needed queries run unconditionally
  const [
    { data: configData, error: configError },
    { data: eventsData, error: eventsError },
    { data: groceriesData, error: groceriesError },
  ] = await Promise.all([
    supabase.from('app_config').select('trip_start_date').single(),
    supabase
      .from('events')
      .select('*')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(3),
    supabase
      .from('grocery_items')
      .select(`*, requested_by:people(*)`)
      .eq('is_checked', false)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  if (configError) console.error('[homePageData] app_config fetch failed:', configError.message)
  if (eventsError) console.error('[homePageData] events fetch failed:', eventsError.message)
  if (groceriesError) console.error('[homePageData] grocery_items fetch failed:', groceriesError.message)

  const tripStartDate = (configData as Tables<'app_config'> | null)?.trip_start_date ?? null
  const upcomingEvents: Tables<'events'>[] = eventsData ?? []
  const recentGroceries: GroceryItemWithPerson[] = groceriesData ?? []

  // Balance-related queries only run when we have a personId
  let balanceCents: number | null = null
  let personName: string | null = null

  if (personId) {
    const [
      { data: expensesData, error: expensesError },
      { data: participantsData, error: participantsError },
      { data: peopleData, error: peopleError },
    ] = await Promise.all([
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('expense_participants').select('*'),
      supabase.from('people').select('*'),
    ])

    if (expensesError) console.error('[homePageData] expenses fetch failed:', expensesError.message)
    if (participantsError) console.error('[homePageData] expense_participants fetch failed:', participantsError.message)
    if (peopleError) console.error('[homePageData] people fetch failed:', peopleError.message)

    if (expensesData && participantsData && peopleData) {
      const expenses: Tables<'expenses'>[] = expensesData
      const participants: Tables<'expense_participants'>[] = participantsData
      const people: Tables<'people'>[] = peopleData

      const person = people.find((p) => p.id === personId)
      personName = person?.name ?? null

      if (expenses.length === 0) {
        // No expenses yet — keep balanceCents as null so the card shows "No expenses yet"
        balanceCents = null
      } else {
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
        const userBalance = balances.find((b) => b.personId === personId)
        balanceCents = userBalance?.amountCents ?? 0
      }
    }
  }

  return {
    tripStartDate,
    upcomingEvents,
    personId,
    personName,
    balanceCents,
    recentGroceries,
  }
}
