'use client'

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div
        className="border p-6 max-w-sm w-full"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          boxShadow: '2px 3px 12px var(--shadow)',
        }}
      >
        <h2
          className="font-[family-name:var(--font-tenor)] text-xs uppercase tracking-[0.06em] mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Something went wrong
        </h2>
        <p
          className="font-[family-name:var(--font-baskerville)] mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          The home page couldn&apos;t load. Check your connection and try again.
        </p>
        <button
          onClick={reset}
          className="font-[family-name:var(--font-tenor)] text-xs uppercase tracking-[0.06em] px-4 py-2 border transition-all hover:-translate-y-0.5"
          style={{
            backgroundColor: 'var(--accent-primary)',
            borderColor: 'var(--accent-primary)',
            color: 'var(--bg-primary)',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
