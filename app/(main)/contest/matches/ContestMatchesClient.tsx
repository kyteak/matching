'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ContestMatch } from '@/types/database'
import { ContestMatchCard } from '@/components/contest/ContestMatchCard'
import { Toast, useToast } from '@/components/Toast'
import { Plus } from 'lucide-react'

export default function ContestMatchesClient() {
  const [matches, setMatches] = useState<ContestMatch[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [applying, setApplying] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toasts, addToast, removeToast } = useToast()

  const fetchMatches = useCallback(async () => {
    const res = await fetch('/api/contest-matches')
    const data = await res.json()
    setMatches(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        const { data: apps } = await supabase
          .from('contest_applications')
          .select('contest_match_id')
          .eq('applicant_id', user.id)
          .neq('status', 'rejected')
        setAppliedIds(new Set(apps?.map((a) => a.contest_match_id) ?? []))
      }
      await fetchMatches()
      setLoading(false)
    }
    init()
  }, [fetchMatches])

  async function handleApply(contestMatchId: string) {
    setApplying(contestMatchId)
    try {
      const res = await fetch(`/api/contest-matches/${contestMatchId}/apply`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { addToast(data.error, 'error'); return }
      setAppliedIds((prev) => new Set([...prev, contestMatchId]))
      addToast('팀 신청이 완료되었습니다!', 'success')
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-white border-b">
        <h1 className="text-lg font-bold text-[#1E3A5F]">공모전 팀 모집</h1>
        <p className="text-xs text-gray-400 mt-0.5">팀원을 찾고 함께 도전하세요!</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-medium">등록된 팀 모집이 없습니다.</p>
            <p className="text-sm mt-1">첫 번째 팀을 모집해보세요!</p>
          </div>
        ) : (
          matches.map((match) => (
            <ContestMatchCard
              key={match.id}
              contest={match}
              currentUserId={currentUserId}
              hasApplied={appliedIds.has(match.id)}
              onApply={handleApply}
              applying={applying === match.id}
            />
          ))
        )}
      </div>

      <Link
        href="/contest/write"
        className="fixed bottom-20 right-4 bg-[#C41230] text-white rounded-full p-4 shadow-lg hover:bg-red-800 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </Link>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
