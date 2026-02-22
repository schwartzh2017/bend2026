import { formatCurrency } from '@/lib/formatCurrency'
import type { SettlementPerson, SettlementBalance } from '@/app/expenses/settle/SettlementClient'

type Props = {
  people: SettlementPerson[]
  balances: SettlementBalance[]
  onSettleUp: () => void
  onPersonClick: (personId: string) => void
}

export default function SettlementOverview({ people, balances, onSettleUp, onPersonClick }: Props) {
  const peopleMap = new Map(people.map((p) => [p.id, p]))

  const sortedBalances = [...balances].sort((a, b) => b.amountCents - a.amountCents)

  const creditors = sortedBalances.filter((b) => b.amountCents > 0)
  const debtors = sortedBalances.filter((b) => b.amountCents < 0)
  const settled = sortedBalances.filter((b) => b.amountCents === 0)

  const totalOwed = creditors.reduce((sum, b) => sum + b.amountCents, 0)

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <span className="font-[family-name:var(--font-baskerville)] text-[var(--text-muted)] text-sm">
          Total unsettled
        </span>
        <span className="font-mono text-xl text-[var(--text-primary)]">
          {formatCurrency(totalOwed)}
        </span>
      </div>

      <div className="space-y-2 mb-8">
        {creditors.map((balance) => {
          const person = peopleMap.get(balance.personId)
          if (!person) return null

          return (
            <button
              key={balance.personId}
              onClick={() => onPersonClick(balance.personId)}
              className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent-primary)] transition-colors"
            >
              <span className="font-[family-name:var(--font-tenor)] text-[var(--text-primary)]">
                {person.name}
              </span>
              <span className="font-mono text-[var(--accent-primary)]">
                +{formatCurrency(balance.amountCents)}
              </span>
            </button>
          )
        })}

        {debtors.map((balance) => {
          const person = peopleMap.get(balance.personId)
          if (!person) return null

          return (
            <button
              key={balance.personId}
              onClick={() => onPersonClick(balance.personId)}
              className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent-warm)] transition-colors"
            >
              <span className="font-[family-name:var(--font-tenor)] text-[var(--text-primary)]">
                {person.name}
              </span>
              <span className="font-mono text-[var(--accent-warm)]">
                {formatCurrency(balance.amountCents)}
              </span>
            </button>
          )
        })}

        {settled.map((balance) => {
          const person = peopleMap.get(balance.personId)
          if (!person) return null

          return (
            <button
              key={balance.personId}
              onClick={() => onPersonClick(balance.personId)}
              className="w-full flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border)] opacity-60"
            >
              <span className="font-[family-name:var(--font-tenor)] text-[var(--text-primary)]">
                {person.name}
              </span>
              <span className="font-mono text-[var(--text-muted)]">$0.00</span>
            </button>
          )
        })}
      </div>

      {creditors.length > 0 && debtors.length > 0 && (
        <button
          onClick={onSettleUp}
          className="w-full py-3 px-6 bg-[var(--accent-primary)] text-[var(--bg-primary)] font-[family-name:var(--font-tenor)] tracking-wide hover:opacity-90 transition-opacity"
        >
          Settle Up
        </button>
      )}
    </div>
  )
}
