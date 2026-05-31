'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  sports: string[]
  levels: string[]
  selectedSport: string
  selectedLevel: string
  onSportChange: (sport: string) => void
  onLevelChange: (level: string) => void
}

const SPORTS = ['전체', '축구', '풋살', '농구', '테니스', '배드민턴', '탁구', 'e스포츠']
const LEVELS = ['전체', '초급', '중급', '고수']
const SPORT_EMOJIS: Record<string, string> = {
  축구: '⚽', 풋살: '🥅', 농구: '🏀', 테니스: '🎾', 배드민턴: '🏸', 탁구: '🏓', 'e스포츠': '🎮',
}

export function FilterBar({
  selectedSport,
  selectedLevel,
  onSportChange,
  onLevelChange,
}: FilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    el?.addEventListener('scroll', updateArrows)
    window.addEventListener('resize', updateArrows)
    return () => {
      el?.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [])

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' })
  }

  return (
    <div className="bg-white border-b border-gray-100 px-2 py-3 space-y-2">
      <div className="flex items-center gap-1">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className="p-1 rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-20 transition-opacity shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {SPORTS.map((sport) => (
            <button
              key={sport}
              onClick={() => onSportChange(sport)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedSport === sport
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {sport !== '전체' ? `${SPORT_EMOJIS[sport]} ${sport}` : sport}
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="p-1 rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-20 transition-opacity shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 px-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onLevelChange(level)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              selectedLevel === level
                ? 'bg-[#FF6B35] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  )
}
