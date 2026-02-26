'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/formatCurrency'
import { calculateExpenseShares } from '@/lib/expenseLogic'
import type { Expense, ExpenseParticipant, Person } from '@/lib/supabase/types'

type ExpenseWithRelations = Expense & {
  paid_by: Person
  expense_participants: (ExpenseParticipant & { person: Person })[]
}

type Props = {
  expense: ExpenseWithRelations
}

export default function ExpenseCard({ expense }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const participantCount = expense.expense_participants.length
  const payerName = expense.paid_by.name
  const payerColor = expense.paid_by.color

  const useLodgingLogic = expense.expense_participants.some((p) => p.nights !== null)

  const participantIds = expense.expense_participants.map((p) => p.person_id)
  const nightsMap = new Map(
    expense.expense_participants.map((p) => [p.person_id, p.nights ?? 0])
  )

  const shares = calculateExpenseShares(
    expense.amount_cents,
    participantIds,
    expense.paid_by.id,
    useLodgingLogic,
    useLodgingLogic ? nightsMap : null
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm p-4 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4
            className="font-[family-name:var(--font-baskerville)] italic text-lg"
            style={{ color: 'var(--text-primary)' }}
          >
            {expense.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="text-sm px-2 py-0.5 rounded-sm"
              style={{
                backgroundColor: payerColor + '20',
                color: payerColor,
              }}
            >
              {payerName}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {formatDate(expense.date)}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span
            className="font-mono text-xl font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatCurrency(expense.amount_cents)}
          </span>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {participantCount} {participantCount === 1 ? 'person' : 'people'}
          </p>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? 'mt-4 pt-4 border-t border-[var(--border)]' : 'max-h-0'
        }`}
      >
        <p
          className="text-sm mb-3 uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Split breakdown
        </p>
        <div className="space-y-2">
          {expense.expense_participants.map((ep) => {
            const share = shares.find((s) => s.personId === ep.person_id)
            const shareAmount = share?.amountCents ?? 0
            const isPayer = ep.person_id === expense.paid_by.id

            return (
              <div
                key={ep.id}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: ep.person.color }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {ep.person.name}
                    {isPayer && (
                      <span style={{ color: 'var(--text-muted)' }}> (paid)</span>
                    )}
                  </span>
                  {useLodgingLogic && ep.nights && (
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      ({ep.nights} {ep.nights === 1 ? 'night' : 'nights'})
                    </span>
                  )}
                </div>
                <span
                  className="font-mono text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatCurrency(shareAmount)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
