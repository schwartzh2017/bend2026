'use client'

import type { Event } from '@/lib/supabase/types'

const eventTypeStyle: Record<string, { borderColor: string; backgroundColor: string }> = {
  travel:   { borderColor: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary)' },
  activity: { borderColor: 'var(--accent-primary)',   backgroundColor: 'var(--accent-primary)' },
  meal:     { borderColor: 'var(--accent-warm)',       backgroundColor: 'var(--accent-warm)' },
  free:     { borderColor: 'var(--text-muted)',        backgroundColor: 'var(--text-muted)' },
  lodging:  { borderColor: 'var(--accent-gold)',       backgroundColor: 'var(--accent-gold)' },
}

const fallbackStyle = eventTypeStyle.activity

type Props = {
  event: Event
  isExpanded: boolean
  onToggle: () => void
}

export default function TimelineEvent({ event, isExpanded, onToggle }: Props) {
  const colors = eventTypeStyle[event.event_type] ?? fallbackStyle

  const startTime = new Date(event.starts_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  })

  const endTime = event.ends_at
    ? new Date(event.ends_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Los_Angeles',
      })
    : null

  return (
    <button
      onClick={onToggle}
      aria-expanded={isExpanded}
      className="w-full text-left group"
    >
      <div
        className="flex gap-4 py-4 border-l-2 pl-4"
        style={{ borderColor: colors.borderColor }}
      >
        <div className="flex flex-col items-center">
          <div
            className="w-2 h-2 rounded-full -ml-[21px]"
            style={{ backgroundColor: colors.backgroundColor }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <time className="font-mono text-sm text-[var(--text-muted)]">
              {endTime ? `${startTime} – ${endTime}` : startTime}
            </time>
            <h3 className="font-[family-name:var(--font-tenor)] text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
              {event.title}
            </h3>
          </div>

          <div
            className={`overflow-hidden transition-all duration-200 ${
              isExpanded ? 'max-h-96 mt-2' : 'max-h-0'
            }`}
          >
            {event.description && (
              <p className="font-[family-name:var(--font-baskerville)] text-[var(--text-secondary)] text-sm leading-relaxed">
                {event.description}
              </p>
            )}
            {event.location && (
              <p className="font-[family-name:var(--font-baskerville)] text-[var(--text-muted)] text-sm mt-1">
                📍 {event.location}
              </p>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
