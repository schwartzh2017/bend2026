'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/home', label: 'HOME', icon: 'home' },
  { href: '/schedule', label: 'SCHEDULE', icon: 'schedule' },
  { href: '/expenses', label: 'EXPENSES', icon: 'expenses' },
  { href: '/grocery', label: 'GROCERY', icon: 'grocery' },
  { href: '/rules', label: 'GAME RULES', icon: 'rules' },
  { href: '/docs', label: 'DOCS', icon: 'docs' },
] as const

const icons = {
  home: (
    <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  schedule: (
    <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  expenses: (
    <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  grocery: (
    <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  docs: (
    <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  rules: (
    <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 8.5v2m-1.5 1.5l1.5-1 1.5 1" />
    </svg>
  ),
}

export default function Nav() {
  const pathname = usePathname()

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t md:hidden flex items-center justify-around"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center py-2 px-3 transition-all"
              style={{
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderTopWidth: isActive ? '3px' : '3px',
                borderTopColor: isActive ? 'var(--accent-primary)' : 'transparent',
                marginTop: isActive ? '-3px' : '0',
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

      <nav
        className="fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col w-[200px] border-r"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex-1 py-6 flex flex-col">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-6 py-3 transition-all"
                style={{
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                  borderLeftWidth: '3px',
                  borderLeftColor: isActive ? 'var(--accent-primary)' : 'transparent',
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
