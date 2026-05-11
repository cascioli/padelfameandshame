'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Home', emoji: '🏠' },
  { href: '/match/new', label: 'Log', emoji: '➕' },
  { href: '/dashboard', label: 'Rankings', emoji: '🏆' },
]

export function Nav({ userId }: { userId: string }) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {NAV_ITEMS.map(({ href, label, emoji }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-xl leading-none">{emoji}</span>
              <span className="font-medium">{label}</span>
            </Link>
          )
        })}
        <Link
          href={`/player/${userId}`}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs rounded-lg transition-colors ${
            pathname.startsWith('/player') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-xl leading-none">👤</span>
          <span className="font-medium">Me</span>
        </Link>
      </div>
    </nav>
  )
}
