'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavIconKey = 'home' | 'schedule' | 'expenses' | 'grocery' | 'docs' | 'rules'

const navItems: ReadonlyArray<{ href: string; label: string; icon: NavIconKey }> = [
  { href: '/home', label: 'HOME', icon: 'home' },
  { href: '/schedule', label: 'SCHEDULE', icon: 'schedule' },
  { href: '/expenses', label: 'EXPENSES', icon: 'expenses' },
  { href: '/grocery', label: 'GROCERY', icon: 'grocery' },
  { href: '/docs', label: 'DOCS', icon: 'docs' },
  { href: '/rules', label: 'RULES', icon: 'rules' },
]

const icons: Record<NavIconKey, React.ReactNode> = {
  home: (
    <svg aria-hidden="true" className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  schedule: (
    <svg aria-hidden="true" className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  expenses: (
    <svg aria-hidden="true" className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  grocery: (
    <svg aria-hidden="true" className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  docs: (
    <svg aria-hidden="true" className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  rules: (
    <svg aria-hidden="true" className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
    </svg>
  ),
}

export default function Nav() {
  const pathname = usePathname()

  function isActive(href: string) {
    // /home exact match, others use startsWith for nested routes
    if (href === '/home') return pathname === '/home'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t md:hidden flex items-center justify-around"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center justify-center py-2 px-3 min-w-[44px] min-h-[44px] transition-all"
              style={{
                color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderTopWidth: '3px',
                borderTopColor: active ? 'var(--accent-primary)' : 'transparent',
                marginTop: '-3px',
              }}
            >
              {icons[item.icon]}
              <span
                className="mt-1 text-[10px] uppercase tracking-[0.06em]"
                style={{ fontFamily: 'var(--font-tenor)' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop sidebar */}
      <nav
        aria-label="Main navigation"
        className="fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col w-[200px] border-r overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex-1 py-6 flex flex-col">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="flex items-center gap-3 px-6 py-3 transition-all"
                style={{
                  color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                  backgroundColor: active ? 'var(--bg-card)' : 'transparent',
                  borderLeftWidth: '3px',
                  borderLeftColor: active ? 'var(--accent-primary)' : 'transparent',
                }}
              >
                {icons[item.icon]}
                <span
                  className="text-xs uppercase tracking-[0.06em]"
                  style={{ fontFamily: 'var(--font-tenor)' }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
