export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <h1
        className="text-4xl mb-4"
        style={{ fontFamily: 'var(--font-tenor)', color: 'var(--text-primary)' }}
      >
        Bend 2026
      </h1>
      <p
        className="text-lg"
        style={{ fontFamily: 'var(--font-baskerville)', color: 'var(--text-muted)' }}
      >
        Welcome to the trip
      </p>
    </div>
  )
}
