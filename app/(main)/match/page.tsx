'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Match, MessageRoom } from '@/types/database'
import { MatchCard } from '@/components/match/MatchCard'
import { FilterBar } from '@/components/match/FilterBar'
import { FacilityBanner } from '@/components/match/FacilityBanner'
import { Toast, useToast } from '@/components/Toast'
import { Plus, CalendarDays, MessageCircle } from 'lucide-react'
import { getTimeAgo } from '@/lib/utils'

export default function MatchPage() {
  const [tab, setTab] = useState<'chat' | 'match'>('match')

  const [matches, setMatches] = useState<Match[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [selectedSport, setSelectedSport] = useState('전체')
  const [selectedLevel, setSelectedLevel] = useState('전체')
  const [applying, setApplying] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [chatRooms, setChatRooms] = useState<MessageRoom[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const { toasts, addToast, removeToast } = useToast()
  const supabase = createClient()

  const fetchMatches = useCallback(async () => {
    const params = new URLSearchParams()
    if (selectedSport !== '전체') params.set('sport', selectedSport)
    if (selectedLevel !== '전체') params.set('level', selectedLevel)
    const res = await fetch(`/api/matches?${params}`)
    const data = await res.json()
    setMatches(Array.isArray(data) ? data : [])
  }, [selectedSport, selectedLevel])

  useEffect(() => {
    async function init() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        const { data: apps } = await supabase
          .from('match_applications')
          .select('match_id')
          .eq('applicant_id', user.id)
          .neq('status', 'rejected')
        setAppliedIds(new Set(apps?.map((a) => a.match_id) ?? []))

        const channel = supabase
          .channel('match-applications-changes')
          .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'match_applications',
            filter: `applicant_id=eq.${user.id}`,
          }, (payload) => {
            setAppliedIds((prev) => {
              const next = new Set(prev)
              next.delete((payload.old as any).match_id)
              return next
            })
          })
          .subscribe()

        return () => { supabase.removeChannel(channel) }
      }
    }
    init()
  }, [])

  useEffect(() => {
    fetchMatches().finally(() => setLoading(false))
  }, [fetchMatches])

  useEffect(() => {
    if (tab === 'chat') {
      setChatLoading(true)
      fetch('/api/messages')
        .then((r) => r.json())
        .then((d) => setChatRooms(Array.isArray(d) ? d : []))
        .finally(() => setChatLoading(false))
    }
  }, [tab])

  async function handleApply(matchId: string) {
    setApplying(matchId)
    try {
      const res = await fetch(`/api/matches/${matchId}/apply`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { addToast(data.error, 'error'); return }
      setAppliedIds((prev) => new Set([...prev, matchId]))
      addToast('매치 신청이 완료되었습니다!', 'success')
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 내부 탭 */}
      <div className="flex bg-white border-b sticky top-14 z-10">
        <button
          onClick={() => setTab('chat')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'chat' ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]' : 'text-gray-400'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          채팅
        </button>
        <button
          onClick={() => setTab('match')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            tab === 'match' ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]' : 'text-gray-400'
          }`}
        >
          매칭 목록
        </button>
      </div>

      {tab === 'chat' ? (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {chatLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">채팅방이 없습니다.</p>
              <p className="text-xs mt-1">매치에 신청하거나 수락되면 채팅이 시작됩니다.</p>
            </div>
          ) : (
            chatRooms.map((room) => (
              <Link
                key={room.id}
                href={`/messages/${room.id}`}
                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-[#1E3A5F] rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1E3A5F] text-sm truncate">
                    {(room as any).match?.title ?? '매치 채팅'}
                  </p>
                  {room.updated_at && (
                    <p className="text-xs text-gray-400 mt-0.5">{getTimeAgo(room.updated_at)}</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <>
          <FilterBar
            sports={[]}
            levels={[]}
            selectedSport={selectedSport}
            selectedLevel={selectedLevel}
            onSportChange={setSelectedSport}
            onLevelChange={setSelectedLevel}
          />
          <FacilityBanner />
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-3">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">⚽</p>
                <p className="font-medium">등록된 매치가 없습니다.</p>
                <p className="text-sm mt-1">첫 번째 매치를 만들어보세요!</p>
              </div>
            ) : (
              matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  currentUserId={currentUserId}
                  hasApplied={appliedIds.has(match.id)}
                  onApply={handleApply}
                  applying={applying === match.id}
                />
              ))
            )}
          </div>

          <Link
            href="/match/write"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#C41230] text-white rounded-full px-6 py-3 shadow-xl hover:bg-red-800 transition-colors flex items-center gap-2 font-bold text-base whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            매치 만들기
          </Link>

          <Link
            href="/sports"
            className="fixed bottom-6 right-4 bg-[#1E3A5F] text-white rounded-full p-4 shadow-xl hover:bg-blue-900 transition-colors flex flex-col items-center gap-1"
          >
            <CalendarDays className="w-6 h-6" />
            <span className="text-xs font-medium">시설</span>
          </Link>
        </>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
