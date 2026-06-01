'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types/database'

export function Header() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let userId: string
    const supabase = createClient()

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      userId = user.id

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      setUnreadCount(count ?? 0)

      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          () => setUnreadCount((prev) => prev + 1)
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    const cleanup = init()
    return () => { cleanup.then((fn) => fn?.()) }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-14">
      <div className="max-w-lg mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/match" className="text-xl font-bold text-[#1E3A5F]">
          충북match
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/notifications" className="relative p-1">
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/profile" className="p-1">
            <User className="w-6 h-6 text-gray-600" />
          </Link>
        </div>
      </div>
    </header>
  )
}
