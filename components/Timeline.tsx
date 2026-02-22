'use client'

import { useState } from 'react'
import TimelineEvent from './TimelineEvent'

type Event = {
  id: string
  title: string
  description: string | null
  location: string | null
  starts_at: string
  ends_at: string | null
  event_type: 'activity' | 'meal' | 'travel' | 'free'
}

type Props = {
  events: Event[]
}

function groupEventsByDay(events: Event[]): Map<string, Event[]> {
  const groups = new Map<string, Event[]>()
  
  for (const event of events) {
    const date = new Date(event.starts_at)
    const dayKey = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Los_Angeles',
    })
    
    if (!groups.has(dayKey)) {
      groups.set(dayKey, [])
    }
    groups.get(dayKey)!.push(event)
  }
  
  return groups
}

export default function Timeline({ events }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  const groupedEvents = groupEventsByDay(events)
  
  return (
    <div className="space-y-8">
      {Array.from(groupedEvents.entries()).map(([day, dayEvents]) => (
        <section key={day}>
          <h2 className="font-[family-name:var(--font-playfair)] font-black text-xl uppercase tracking-wider text-[var(--text-primary)] mb-4">
            {day}
          </h2>
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isExpanded={expandedId === event.id}
                onToggle={() => setExpandedId(expandedId === event.id ? null : event.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
