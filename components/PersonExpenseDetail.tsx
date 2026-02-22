import { formatCurrency } from '@/lib/formatCurrency'
import type { SettlementPerson, SettlementBalance, SettlementExpense } from '@/app/expenses/settle/SettlementClient'

type Props = {
  person: SettlementPerson
  balance: SettlementBalance
  expenses: SettlementExpense[]
  peopleMap: Map<string, SettlementPerson>
  onClose: () => void
}

export default function PersonExpenseDetail({
  person,
  balance,
  expenses,
  peopleMap,
  onClose,
}: Props) {
  const expensesByCategory = new Map<string, SettlementExpense[]>()
  for (const e of expenses) {
    const existing = expensesByCategory.get(e.category) ?? []
    existing.push(e)
    expensesByCategory.set(e.category, existing)
  }

  const sortedCategories = Array.from(expensesByCategory.keys()).sort()

  const totalPaid = expenses
    .filter((e) => e.paidBy === person.id)
    .reduce((sum, e) => sum + e.amountCents, 0)

  const totalShare = expenses.reduce((sum, e) => {
    const share = e.participants.find((p) => p.personId === person.id)
    return sum + (share?.amountCents ?? 0)
  }, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-primary)] w-full max-w-md max-h-[80vh] overflow-auto border border-[var(--border)]">
        <div className="sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-[family-name:var(--font-tenor)] text-xl text-[var(--text-primary)]">
              {person.name}
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-baskerville)] text-[var(--text-muted)] text-sm">
              Net balance:
            </span>
            <span
              className={`font-mono text-lg ${
                balance.amountCents > 0
                  ? 'text-[var(--accent-secondary)]'
                  : balance.amountCents < 0
                    ? 'text-[var(--accent-warm)]'
                    : 'text-[var(--text-muted)]'
              }`}
            >
              {balance.amountCents >= 0 ? '+' : ''}
              {formatCurrency(balance.amountCents)}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[var(--bg-card)] border border-[var(--border)]">
            <div>
              <p className="font-[family-name:var(--font-baskerville)] text-[var(--text-muted)] text-xs mb-1">
                Total paid
              </p>
              <p className="font-mono text-[var(--text-primary)]">{formatCurrency(totalPaid)}</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-baskerville)] text-[var(--text-muted)] text-xs mb-1">
                Total share
              </p>
              <p className="font-mono text-[var(--text-primary)]">{formatCurrency(totalShare)}</p>
            </div>
          </div>

          {expenses.length === 0 ? (
            <p className="font-[family-name:var(--font-baskerville)] text-[var(--text-muted)] text-sm">
              No expenses yet
            </p>
          ) : (
            sortedCategories.map((category) => {
              const categoryExpenses = expensesByCategory.get(category) ?? []
              return (
                <div key={category} className="mb-6">
                  <h3 className="font-[family-name:var(--font-tenor)] text-[var(--text-muted)] text-sm uppercase tracking-wider mb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryExpenses.map((e) => {
                      const share = e.participants.find((p) => p.personId === person.id)
                      const payer = peopleMap.get(e.paidBy)
                      const isPayer = e.paidBy === person.id

                      return (
                        <div
                          key={e.id}
                          className="p-3 bg-[var(--bg-card)] border border-[var(--border)]"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <p className="font-[family-name:var(--font-baskerville)] text-[var(--text-primary)] text-sm">
                                {e.title}
                              </p>
                              <p className="font-[family-name:var(--font-baskerville)] text-[var(--text-muted)] text-xs">
                                {isPayer ? 'You paid' : `Paid by ${payer?.name ?? 'Unknown'}`}
                              </p>
                            </div>
                            <p className="font-mono text-[var(--text-primary)] text-sm">
                              {formatCurrency(e.amountCents)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-[family-name:var(--font-baskerville)] text-[var(--text-muted)]">
                              Your share
                            </span>
                            <span className="font-mono text-[var(--text-secondary)]">
                              {formatCurrency(share?.amountCents ?? 0)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
