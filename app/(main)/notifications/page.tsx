'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { getTimeAgo } from '@/lib/utils'
import { Bell } from 'lucide-react'

const TYPE_LABEL: Record<string, string> = {
  match_apply: '새 매치 신청',
  match_accept: '매치 신청 수락',
  match_reject: '매치 신청 거절',
  match_cancel: '매치 취소',
  new_message: '새 메시지',
  contest_apply: '공모전 팀 신청',
  contest_accept: '팀 합류 수락',
  contest_reject: '팀 합류 거절',
}

export default function NotificationsPage() {
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

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
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
          <Button variant="ghost" onClick={markAll} loading={markingAll} className="text-sm">
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
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                n.is_read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#1E3A5F] mb-1">
                    {TYPE_LABEL[n.type] ?? n.type}
                  </p>
                  <p className="text-sm text-gray-700">{n.message}</p>
                </div>
                {!n.is_read && (
                  <span className="w-2 h-2 bg-[#FF6B35] rounded-full mt-1 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">{getTimeAgo(n.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
