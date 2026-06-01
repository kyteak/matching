'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageRoom } from '@/types/database'
import { getTimeAgo } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

type ContestRoom = {
  id: string
  name: string
  contest_match_id: string
  lastMessage?: string
  updatedAt?: string
}

export default function MessagesPage() {
  const [tab, setTab] = useState<'match' | 'contest'>('match')
  const [matchRooms, setMatchRooms] = useState<MessageRoom[]>([])
  const [contestRooms, setContestRooms] = useState<ContestRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [mRes, cRes] = await Promise.all([
        fetch('/api/messages'),
        fetch('/api/contest-rooms'),
      ])
      const [mData, cData] = await Promise.all([mRes.json(), cRes.json()])
      setMatchRooms(Array.isArray(mData) ? mData : [])
      setContestRooms(Array.isArray(cData) ? cData : [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b bg-white sticky top-14">
        {(['match', 'contest'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === t
                ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]'
                : 'text-gray-400'
            }`}
          >
            {t === 'match' ? '1:1 매치 채팅' : '공모전 팀 채팅'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
          </div>
        ) : tab === 'match' ? (
          matchRooms.length === 0 ? (
            <EmptyState label="매치 채팅방이 없습니다." />
          ) : (
            matchRooms.map((room) => (
              <Link
                key={room.id}
                href={`/messages/${room.id}`}
                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1E3A5F] text-sm truncate">
                    {(room as any).match?.title ?? '매치 채팅'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {room.updated_at ? getTimeAgo(room.updated_at) : ''}
                  </p>
                </div>
              </Link>
            ))
          )
        ) : (
          contestRooms.length === 0 ? (
            <EmptyState label="공모전 팀 채팅방이 없습니다." />
          ) : (
            contestRooms.map((room) => (
              <Link
                key={room.id}
                href={`/messages/contest/${room.id}`}
                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-[#C41230] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1E3A5F] text-sm truncate">{room.name}</p>
                </div>
              </Link>
            ))
          )
        )}
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-medium">{label}</p>
    </div>
  )
}
