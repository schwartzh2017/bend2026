import HomeCard from './HomeCard'
import { formatCurrency } from '@/lib/formatCurrency'

type Props = {
  personId: string | null
  balanceCents: number | null
}

export default function BalanceCard({ personId, balanceCents }: Props) {
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

  const isPositive = balanceCents > 0
  const label = isPositive ? "You're owed" : 'You owe'
  const amountColor = isPositive ? 'var(--accent-primary)' : 'var(--accent-warm)'

  return (
    <HomeCard title="Your Balance" href="/expenses/settle">
      <p style={{ color: amountColor }}>
        <span className="font-[family-name:var(--font-baskerville)] text-base">
          {label}{' '}
        </span>
        <span className="font-[family-name:var(--font-jetbrains)] text-2xl">
          {formatCurrency(Math.abs(balanceCents))}
        </span>
      </p>
    </HomeCard>
  )
}
