'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Match } from '@/types/database'
import { MatchCard } from '@/components/match/MatchCard'
import { FilterBar } from '@/components/match/FilterBar'
import { FacilityBanner } from '@/components/match/FacilityBanner'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/Toast'
import { Plus } from 'lucide-react'

export default function MatchPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [selectedSport, setSelectedSport] = useState('전체')
  const [selectedLevel, setSelectedLevel] = useState('전체')
  const [applying, setApplying] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
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
      <FilterBar
        sports={[]}
        levels={[]}
        selectedSport={selectedSport}
        selectedLevel={selectedLevel}
        onSportChange={setSelectedSport}
        onLevelChange={setSelectedLevel}
      />

      <FacilityBanner />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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
        className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#FF6B35] text-white rounded-full px-6 py-3 shadow-xl hover:bg-orange-500 transition-colors flex items-center gap-2 font-bold text-base whitespace-nowrap"
      >
        <Plus className="w-5 h-5" />
        매치 만들기
      </Link>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
