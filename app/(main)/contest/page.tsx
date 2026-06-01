'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Contest } from '@/types/database'
import { REGION_COLORS } from '@/lib/utils'
import { Bookmark, BookmarkCheck, ExternalLink, Trophy } from 'lucide-react'

const REGIONS = ['전체', '충청북도', '충청남도', '세종특별자치시', '대전광역시']

export default function ContestPage() {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState('전체')
  const [contests, setContests] = useState<Contest[]>([])
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  async function handleTeamMatchClick() {
    const res = await fetch('/api/contest-resume')
    if (!res.ok) { router.push('/login'); return }
    const data = await res.json()
    if (data) {
      router.push('/contest/matches')
    } else {
      router.push('/contest/resume')
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('contest-bookmarks')
    if (saved) {
      try { setBookmarks(new Set(JSON.parse(saved))) } catch {}
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedRegion !== '전체') params.set('region', selectedRegion)
    fetch(`/api/contests?${params}`)
      .then((r) => r.json())
      .then((d) => setContests(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [selectedRegion])

  function toggleBookmark(id: string) {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('contest-bookmarks', JSON.stringify([...next]))
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto flex gap-2 px-4 py-3 bg-white border-b scrollbar-hide flex-shrink-0 sticky top-14 z-10">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selectedRegion === r
                ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-40 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
          </div>
        ) : contests.length === 0 ? (
          <EmptyState />
        ) : (
          contests.map((c) => {
            const regionKey = c.region as keyof typeof REGION_COLORS
            const regionStyle = regionKey ? REGION_COLORS[regionKey] : null
            return (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      {regionStyle && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${regionStyle.bg} ${regionStyle.text}`}>
                          {regionStyle.emoji} {c.region}
                        </span>
                      )}
                      {c.field && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {c.field}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#1E3A5F] text-sm leading-snug">{c.title}</h3>
                    {c.organizer && <p className="text-xs text-gray-500 mt-1">주최: {c.organizer}</p>}
                    <p className="text-xs text-gray-500">마감: {c.end_date}</p>
                  </div>
                  <button onClick={() => toggleBookmark(c.id)} className="flex-shrink-0 mt-1">
                    {bookmarks.has(c.id)
                      ? <BookmarkCheck className="w-5 h-5 text-[#FF6B35]" />
                      : <Bookmark className="w-5 h-5 text-gray-300" />
                    }
                  </button>
                </div>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1 text-xs text-[#1E3A5F] font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    자세히 보기
                  </a>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-4 pb-2">
        <button
          onClick={handleTeamMatchClick}
          className="w-full bg-[#FF6B35] hover:bg-orange-500 active:bg-orange-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-base shadow-lg transition-colors"
        >
          <Trophy className="w-5 h-5" />
          공모전 팀 모집 참여하기
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-400">
      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-medium">공모전 정보가 없습니다.</p>
      <p className="text-xs mt-1">크롤러가 데이터를 수집 중입니다.</p>
    </div>
  )
}
