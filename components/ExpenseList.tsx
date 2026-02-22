'use client'

import CategoryHeader from './CategoryHeader'
import ExpenseCard from './ExpenseCard'
import type { Expense, ExpenseParticipant, Person } from '@/lib/supabase/types'

type ExpenseWithRelations = Expense & {
  paid_by: Person
  expense_participants: (ExpenseParticipant & { person: Person })[]
}

type Props = {
  expenses: ExpenseWithRelations[]
}

const categoryOrder = ['lodging', 'food', 'alcohol', 'transport', 'activities', 'general']

function groupByCategory(expenses: ExpenseWithRelations[]): Map<string, ExpenseWithRelations[]> {
  const groups = new Map<string, ExpenseWithRelations[]>()

  for (const expense of expenses) {
    const category = expense.category || 'general'
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category)!.push(expense)
  }

  const sortedGroups = new Map<string, ExpenseWithRelations[]>()
  for (const category of categoryOrder) {
    if (groups.has(category)) {
      sortedGroups.set(category, groups.get(category)!)
    }
  }

  for (const [category, categoryExpenses] of groups) {
    if (!sortedGroups.has(category)) {
      sortedGroups.set(category, categoryExpenses)
    }
  }

  return sortedGroups
}

export default function ExpenseList({ expenses }: Props) {
  const groupedExpenses = groupByCategory(expenses)

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--text-muted)' }}>
          No expenses yet. Add your first expense to get started.
        </p>
      </div>
    )
  }

  return (
    <div>
      {Array.from(groupedExpenses.entries()).map(([category, categoryExpenses]) => (
        <div key={category}>
          <CategoryHeader category={category} />
          <div className="space-y-3">
            {categoryExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
