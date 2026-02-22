import Link from 'next/link'

type Props = {
  title: string
  href: string
  children: React.ReactNode
}

export default function HomeCard({ title, href, children }: Props) {
  return (
    <Link href={href} className="block">
      <div
        className="border p-5 transition-all hover:-translate-y-0.5"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          boxShadow: '2px 3px 12px var(--shadow)',
        }}
      >
        <h2
          className="font-[family-name:var(--font-tenor)] text-xs uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {title}
        </h2>
        {children}
      </div>
    </Link>
  )
}
