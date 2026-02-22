'use client'

type Event = {
  id: string
  title: string
  description: string | null
  location: string | null
  starts_at: string
  ends_at: string | null
  event_type: 'activity' | 'meal' | 'travel' | 'free'
}

const eventTypeColors: Record<Event['event_type'], { border: string; dot: string }> = {
  travel: { border: 'border-[#7A9E7E]', dot: 'bg-[#7A9E7E]' },
  activity: { border: 'border-[#3D5A3E]', dot: 'bg-[#3D5A3E]' },
  meal: { border: 'border-[#A0522D]', dot: 'bg-[#A0522D]' },
  free: { border: 'border-[#8C7E6A]', dot: 'bg-[#8C7E6A]' },
}

type Props = {
  event: Event
  isExpanded: boolean
  onToggle: () => void
}

export default function TimelineEvent({ event, isExpanded, onToggle }: Props) {
  const colors = eventTypeColors[event.event_type]
  
  const startTime = new Date(event.starts_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  })

  return (
    <button
      onClick={onToggle}
      className="w-full text-left group"
    >
      <div className={`flex gap-4 py-4 border-l-2 pl-4 ${colors.border}`}>
        <div className="flex flex-col items-center">
          <div className={`w-2 h-2 rounded-full -ml-[21px] ${colors.dot}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <time className="font-mono text-sm text-[var(--text-muted)]">
              {startTime}
            </time>
            <h3 className="font-[family-name:var(--font-playfair)] italic text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
              {event.title}
            </h3>
          </div>
          
          <div
            className={`overflow-hidden transition-all duration-200 ${
              isExpanded ? 'max-h-40 mt-2' : 'max-h-0'
            }`}
          >
            {event.description && (
              <p className="font-[family-name:var(--font-source-serif)] text-[var(--text-secondary)] text-sm leading-relaxed">
                {event.description}
              </p>
            )}
            {event.location && (
              <p className="font-[family-name:var(--font-source-serif)] text-[var(--text-muted)] text-sm mt-1">
                📍 {event.location}
              </p>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
