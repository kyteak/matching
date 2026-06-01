'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Contest } from '@/types/database'
import { REGION_COLORS } from '@/lib/utils'
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, ExternalLink, Trophy, Users, MessageCircle } from 'lucide-react'

type ContestRoom = {
  id: string
  name: string
  contest_match_id: string
}

export default function ContestPage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [tab, setTab] = useState<'chat' | 'contest'>('contest')
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [regions, setRegions] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('전체')
  const [contests, setContests] = useState<Contest[]>([])
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const [chatRooms, setChatRooms] = useState<ContestRoom[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' })
  }

  useEffect(() => { updateArrows() }, [regions])

  async function handleTeamCreate(c: Contest) {
    const writeUrl = `/contest/write?title=${encodeURIComponent(c.title)}&region=${encodeURIComponent(c.region ?? '')}&deadline=${encodeURIComponent(c.end_date ?? '')}`
    const res = await fetch('/api/contest-resume')
    if (!res.ok) { router.push('/login'); return }
    const data = await res.json()
    if (data) {
      router.push(writeUrl)
    } else {
      router.push(`/contest/resume?redirect=${encodeURIComponent(writeUrl)}`)
    }
  }

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

  useEffect(() => {
    if (tab === 'chat') {
      setChatLoading(true)
      fetch('/api/contest-rooms')
        .then((r) => r.json())
        .then((d) => setChatRooms(Array.isArray(d) ? d : []))
        .finally(() => setChatLoading(false))
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
          onClick={() => setTab('contest')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            tab === 'contest' ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' : 'text-gray-400'
          }`}
        >
          공모전
        </button>
      </div>

      {tab === 'chat' ? (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {chatLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">팀 채팅방이 없습니다.</p>
              <p className="text-xs mt-1">공모전 팀에 합류하면 채팅이 시작됩니다.</p>
            </div>
          ) : (
            chatRooms.map((room) => (
              <Link
                key={room.id}
                href={`/messages/contest/${room.id}`}
                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1E3A5F] text-sm truncate">{room.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">공모전 팀 채팅</p>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <>
          {/* 지역 필터 */}
          <div className="flex items-center bg-white border-b sticky top-[88px] z-10">
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
                      ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
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
                <div className="animate-spin w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
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
                      <button
                        onClick={() => handleTeamCreate(c)}
                        className="flex items-center gap-1 text-xs text-white bg-[#FF6B35] px-2.5 py-1 rounded-full font-medium hover:bg-orange-500 transition-colors"
                      >
                        <Users className="w-3 h-3" />
                        팀 만들기
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
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
