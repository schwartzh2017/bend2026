import HomeCard from './HomeCard'

type Props = {
  personId: string | null
  balanceCents: number | null
}

function formatCurrency(cents: number): string {
  const dollars = Math.abs(cents) / 100
  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
}

export default function BalanceCard({ personId, balanceCents }: Props) {
  if (!personId) {
    return (
      <HomeCard title="Your Balance" href="/identify?returnUrl=/">
        <p style={{ color: 'var(--text-muted)' }}>Tap to identify yourself</p>
      </HomeCard>
    )
  }

  const isPositive = balanceCents !== null && balanceCents > 0
  const isNegative = balanceCents !== null && balanceCents < 0
  const isZero = balanceCents !== null && balanceCents === 0

  let displayText: string
  let textColor: string

  if (isZero) {
    displayText = 'All settled up'
    textColor = 'var(--text-secondary)'
  } else if (isPositive) {
    displayText = `You're owed ${formatCurrency(balanceCents!)}`
    textColor = 'var(--accent-primary)'
  } else if (isNegative) {
    displayText = `You owe ${formatCurrency(balanceCents!)}`
    textColor = 'var(--accent-warm)'
  } else {
    displayText = 'No expenses yet'
    textColor = 'var(--text-muted)'
  }

  return (
    <HomeCard title="Your Balance" href="/expenses/settle">
      <p
        className="font-[family-name:var(--font-tenor)] text-2xl"
        style={{ color: textColor }}
      >
        {displayText}
      </p>
    </HomeCard>
  )
}
