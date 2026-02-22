import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <h1
        className="mb-4 text-4xl"
        style={{ fontFamily: 'var(--font-tenor)', color: 'var(--text-primary)' }}
      >
        Page not found
      </h1>
      <p
        className="mb-8 text-base"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
      >
        That page doesn&apos;t exist.
      </p>
      <Link
        href="/home"
        className="px-6 py-3 text-sm uppercase tracking-[0.06em] transition-opacity hover:opacity-80"
        style={{
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--bg-card)',
          fontFamily: 'var(--font-tenor)',
        }}
      >
        Go home
      </Link>
    </div>
  )
}
