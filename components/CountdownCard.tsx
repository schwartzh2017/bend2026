import HomeCard from './HomeCard'

type Props = {
  tripStartDate: string | null
}

function formatCountdown(targetDate: Date): string {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()

  if (diff <= 0) {
    return 'Trip in progress!'
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }

  if (hours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`
  }

  return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`
}

export default function CountdownCard({ tripStartDate }: Props) {
  const content = tripStartDate
    ? formatCountdown(new Date(tripStartDate))
    : 'Date coming soon'

  return (
    <HomeCard title="Trip Countdown" href="/schedule">
      <p
        className="font-[family-name:var(--font-tenor)] text-3xl"
        style={{ color: 'var(--text-primary)' }}
      >
        {content}
      </p>
    </HomeCard>
  )
}
