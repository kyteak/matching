'use client'

import { cn } from '@/lib/utils'

interface FilterBarProps {
  sports: string[]
  levels: string[]
  selectedSport: string
  selectedLevel: string
  onSportChange: (sport: string) => void
  onLevelChange: (level: string) => void
}

const SPORTS = ['전체', '축구', '풋살', '농구', 'e스포츠']
const LEVELS = ['전체', '초급', '중급', '고수']
const SPORT_EMOJIS: Record<string, string> = {
  축구: '⚽', 풋살: '🥅', 농구: '🏀', 'e스포츠': '🎮',
}

export function FilterBar({
  selectedSport,
  selectedLevel,
  onSportChange,
  onLevelChange,
}: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3 space-y-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
            {sport !== '전체' ? `${SPORT_EMOJIS[sport]}${sport}` : sport}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
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
