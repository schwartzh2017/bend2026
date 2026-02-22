import HomeCard from './HomeCard'
import type { Event } from '@/lib/supabase/types'

type Props = {
  events: Event[]
}

const eventTypeColors: Record<string, string> = {
  travel: 'var(--accent-secondary)',
  activity: 'var(--accent-primary)',
  meal: 'var(--accent-warm)',
  free: 'var(--text-muted)',
  lodging: 'var(--accent-gold)',
}

export default function UpcomingEventsCard({ events }: Props) {
  if (events.length === 0) {
    return (
      <HomeCard title="Upcoming" href="/schedule">
        <p style={{ color: 'var(--text-muted)' }}>No events scheduled</p>
      </HomeCard>
    )
  }

  return (
    <HomeCard title="Upcoming" href="/schedule">
      <div className="space-y-3">
        {events.map((event) => {
          const eventDate = new Date(event.starts_at)
          const date = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'America/Los_Angeles',
          })
          const time = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Los_Angeles',
          })
          const dotColor = eventTypeColors[event.event_type] ?? eventTypeColors.activity

          return (
            <div key={event.id} className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: dotColor }}
              />
              <time
                className="font-[family-name:var(--font-jetbrains)] text-sm flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {date} · {time}
              </time>
              <span
                className="font-[family-name:var(--font-baskerville)] truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {event.title}
              </span>
            </div>
          )
        })}
      </div>
    </HomeCard>
  )
}
