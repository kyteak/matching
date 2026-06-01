'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Contest } from '@/types/database'
import { REGION_COLORS } from '@/lib/utils'
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, ExternalLink, Trophy, Users } from 'lucide-react'

export default function ContestPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [regions, setRegions] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('전체')
  const [contests, setContests] = useState<Contest[]>([])
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' })
  }

  useEffect(() => {
    updateArrows()
  }, [regions])

  useEffect(() => {
    const saved = localStorage.getItem('contest-bookmarks')
    if (saved) {
      try { setBookmarks(new Set(JSON.parse(saved))) } catch {}
    }
    fetch('/api/contests/regions')
      .then((r) => r.json())
      .then((d) => setRegions(Array.isArray(d) ? d : []))
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
      <div className="flex items-center bg-white border-b sticky top-14 z-10">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className="flex-shrink-0 px-1 py-3 text-gray-400 disabled:opacity-20 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex-1 overflow-x-auto flex gap-2 py-3 scrollbar-hide"
        >
          {['전체', ...regions].map((r) => (
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
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="flex-shrink-0 px-1 py-3 text-gray-400 disabled:opacity-20 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4 space-y-3">
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
                <div className="mt-3 flex items-center gap-3">
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#1E3A5F] font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      자세히 보기
                    </a>
                  )}
                  <Link
                    href={`/contest/write?title=${encodeURIComponent(c.title)}&region=${encodeURIComponent(c.region ?? '')}&deadline=${encodeURIComponent(c.end_date ?? '')}`}
                    className="flex items-center gap-1 text-xs text-white bg-[#FF6B35] px-2.5 py-1 rounded-full font-medium hover:bg-orange-500 transition-colors"
                  >
                    <Users className="w-3 h-3" />
                    팀 만들기
                  </Link>
                </div>
              </div>
            )
          })
        )}
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
