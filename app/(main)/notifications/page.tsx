'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { getTimeAgo } from '@/lib/utils'
import { Bell, ChevronRight, CheckCheck } from 'lucide-react'

const TYPE_CONFIG: Record<string, { label: string; dotColor: string; labelColor: string }> = {
  match_apply:    { label: '새 매치 신청', dotColor: 'bg-blue-500',   labelColor: 'text-blue-600'  },
  match_accept:   { label: '신청 수락',    dotColor: 'bg-green-500',  labelColor: 'text-green-600' },
  match_reject:   { label: '신청 거절',    dotColor: 'bg-red-500',    labelColor: 'text-red-500'   },
  match_cancel:   { label: '매치 취소',    dotColor: 'bg-gray-400',   labelColor: 'text-gray-500'  },
  new_message:    { label: '새 메시지',    dotColor: 'bg-purple-500', labelColor: 'text-purple-600'},
  contest_apply:  { label: '대회 팀 신청', dotColor: 'bg-blue-500',   labelColor: 'text-blue-600'  },
  contest_accept: { label: '팀 합류 수락', dotColor: 'bg-green-500',  labelColor: 'text-green-600' },
  contest_reject: { label: '팀 합류 거절', dotColor: 'bg-red-500',    labelColor: 'text-red-500'   },
}

function getLink(n: Notification): string | null {
  if (!n.related_id) return null
  if (n.type === 'new_message') return '/messages'
  if (n.type.startsWith('contest_')) return `/contest/${n.related_id}`
  return `/match/${n.related_id}`
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setNotifications(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let cleanup: (() => void) | undefined
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const channel = supabase
        .channel('notif-page')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        })
        .subscribe()
      cleanup = () => supabase.removeChannel(channel)
    })
    return () => cleanup?.()
  }, [])

  async function handleClick(n: Notification) {
    if (!n.is_read) {
      await fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' })
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
      )
    }
    const link = getLink(n)
    if (link) router.push(link)
  }

  async function markAll() {
    setMarkingAll(true)
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#1E3A5F]">알림</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={markAll} loading={markingAll} className="text-sm gap-1">
            <CheckCheck className="w-4 h-4" />
            모두 읽음
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">알림이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] ?? { label: n.type, dotColor: 'bg-gray-400', labelColor: 'text-gray-600' }
            const link = getLink(n)
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`p-4 rounded-xl border transition-colors flex items-start gap-3 ${
                  n.is_read ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-200'
                } ${link ? 'cursor-pointer hover:shadow-sm' : ''}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.is_read ? 'bg-gray-200' : config.dotColor}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold mb-0.5 ${config.labelColor}`}>
                    {config.label}
                  </p>
                  <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{getTimeAgo(n.created_at)}</p>
                </div>
                {link && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
