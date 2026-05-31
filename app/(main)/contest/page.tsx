'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalContest, StaticContest } from '@/types/database'
import { getAllActiveContests, getContestsByRegion } from '@/data/contests'
import { REGION_COLORS } from '@/lib/utils'
import { Bookmark, BookmarkCheck, ExternalLink, Trophy } from 'lucide-react'

const REGIONS = ['전체', '충청북도', '충청남도', '세종특별자치시', '대전광역시']

export default function ContestPage() {
  const [tab, setTab] = useState<'static' | 'external'>('static')
  const [selectedRegion, setSelectedRegion] = useState('전체')
  const [externalContests, setExternalContests] = useState<ExternalContest[]>([])
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const staticContests: StaticContest[] =
    selectedRegion === '전체' ? getAllActiveContests() : getContestsByRegion(selectedRegion)

  useEffect(() => {
    const saved = localStorage.getItem('contest-bookmarks')
    if (saved) {
      try { setBookmarks(new Set(JSON.parse(saved))) } catch {}
    }
  }, [])

  useEffect(() => {
    if (tab === 'external') {
      setLoading(true)
      fetch('/api/external-contests')
        .then((r) => r.json())
        .then((d) => setExternalContests(Array.isArray(d) ? d : []))
        .finally(() => setLoading(false))
    }
  }, [tab])

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
      <div className="flex border-b bg-white sticky top-14 z-10">
        <button
          onClick={() => setTab('static')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            tab === 'static' ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]' : 'text-gray-400'
          }`}
        >
          충청권 공모전
        </button>
        <button
          onClick={() => setTab('external')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            tab === 'external' ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]' : 'text-gray-400'
          }`}
        >
          외부 공모전
        </button>
      </div>

      {tab === 'static' && (
        <div className="overflow-x-auto flex gap-2 px-4 py-3 bg-white border-b scrollbar-hide flex-shrink-0">
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
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {tab === 'static' ? (
          staticContests.length === 0 ? (
            <EmptyState />
          ) : (
            staticContests.map((c) => {
              const regionStyle = REGION_COLORS[c.region]
              return (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {regionStyle && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${regionStyle.bg} ${regionStyle.text}`}>
                            {regionStyle.emoji} {c.region}
                          </span>
                          {c.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {c.category}
                            </span>
                          )}
                        </div>
                      )}
                      <h3 className="font-semibold text-[#1E3A5F] text-sm leading-snug">{c.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">주최: {c.organizer}</p>
                      <p className="text-xs text-gray-500">마감: {c.deadline}</p>
                      {c.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>
                      )}
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
          )
        ) : loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
          </div>
        ) : externalContests.length === 0 ? (
          <EmptyState />
        ) : (
          externalContests.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm p-4">
              {c.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mb-2 inline-block">
                  {c.category}
                </span>
              )}
              <h3 className="font-semibold text-[#1E3A5F] text-sm leading-snug">{c.title}</h3>
              {c.organizer && <p className="text-xs text-gray-500 mt-1">주최: {c.organizer}</p>}
              {c.deadline && <p className="text-xs text-gray-500">마감: {c.deadline}</p>}
              {c.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>
              )}
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
          ))
        )}
      </div>

      <Link
        href="/contest/matches"
        className="fixed bottom-20 right-4 bg-[#FF6B35] text-white rounded-full px-4 py-3 shadow-lg flex items-center gap-2 text-sm font-semibold hover:bg-orange-500 transition-colors"
      >
        <Trophy className="w-4 h-4" />
        팀 모집
      </Link>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-400">
      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-medium">공모전 정보가 없습니다.</p>
    </div>
  )
}
