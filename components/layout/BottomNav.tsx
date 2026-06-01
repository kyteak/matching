'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, Swords, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/match', label: '매치', icon: Swords },
  { href: '/contest', label: '공모전', icon: Trophy },
  { href: '/messages', label: '메시지', icon: MessageSquare },
  { href: '/profile', label: '내 정보', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 h-16">
      <div className="max-w-lg mx-auto h-full flex items-center">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors',
                active ? 'text-[#1E3A5F]' : 'text-gray-400'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
