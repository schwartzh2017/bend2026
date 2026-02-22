import HomeCard from './HomeCard'
import { formatCurrency } from '@/lib/formatCurrency'
import type { HomePageTransaction } from '@/lib/homePageData'

type Props = {
  personId: string | null
  balanceCents: number | null
  myTransactions: HomePageTransaction[]
}

export default function BalanceCard({ personId, balanceCents, myTransactions }: Props) {
  if (!personId) {
    return (
      <HomeCard title="Your Balance" href="/identify?returnUrl=/">
        <p style={{ color: 'var(--text-muted)' }}>Tap to identify yourself</p>
      </HomeCard>
    )
  }

  if (balanceCents === null) {
    return (
      <HomeCard title="Your Balance" href="/expenses/settle">
        <p style={{ color: 'var(--text-muted)' }}>No expenses yet</p>
      </HomeCard>
    )
  }

  if (balanceCents === 0) {
    return (
      <HomeCard title="Your Balance" href="/expenses/settle">
        <p
          className="font-[family-name:var(--font-tenor)] text-2xl"
          style={{ color: 'var(--text-secondary)' }}
        >
          All settled up
        </p>
      </HomeCard>
    )
  }

  return (
    <HomeCard title="Your Balance" href="/expenses/settle">
      <div className="space-y-1.5">
        {myTransactions.map((t) => (
          <p key={t.counterpartId} style={{ color: t.direction === 'owe' ? 'var(--accent-warm)' : 'var(--accent-primary)' }}>
            <span className="font-[family-name:var(--font-baskerville)] text-sm">
              {t.direction === 'owe' ? 'You owe ' : ''}
              {t.direction === 'owed' ? `${t.counterpartName} owes you ` : t.counterpartName + ' '}
            </span>
            <span className="font-[family-name:var(--font-jetbrains)] text-lg">
              {formatCurrency(t.amountCents)}
            </span>
          </p>
        ))}
      </div>
    </HomeCard>
  )
}
