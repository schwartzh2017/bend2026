import Timeline from '@/components/Timeline'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function SchedulePage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true })
  
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-[family-name:var(--font-playfair)] font-black text-3xl text-[var(--text-primary)] mb-8">
            Schedule
          </h1>
          <p className="text-[var(--text-muted)]">
            Unable to load events. Please try again later.
          </p>
        </div>
      </div>
    )
  }
  
  if (!events || events.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-[family-name:var(--font-playfair)] font-black text-3xl text-[var(--text-primary)] mb-8">
            Schedule
          </h1>
          <p className="text-[var(--text-muted)]">
            No events scheduled yet.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4">
      <div className="max-w-[680px] mx-auto">
        <h1 className="font-[family-name:var(--font-playfair)] font-black text-3xl text-[var(--text-primary)] mb-8">
          Schedule
        </h1>
        <Timeline events={events} />
      </div>
    </div>
  )
}
