'use client'

import Link from 'next/link'
import { Match } from '@/types/database'
import { SPORT_COLORS, LEVEL_COLORS, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MapPin, Clock, Users } from 'lucide-react'

interface MatchCardProps {
  match: Match
  currentUserId?: string
  hasApplied?: boolean
  onApply?: (matchId: string) => void
  applying?: boolean
}

export function MatchCard({ match, currentUserId, hasApplied, onApply, applying }: MatchCardProps) {
  const sport = SPORT_COLORS[match.sport]
  const level = LEVEL_COLORS[match.required_level]
  const isOwner = match.author_id === currentUserId
  const isConfirmed = match.status === '매치확정'
  const isCancelled = match.status === '취소됨'

  return (
    <Link href={`/match/${match.id}`} className="block bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${sport.bg} ${sport.text}`}>
            {sport.emoji} {match.sport}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${level.bg} ${level.text}`}>
            {match.required_level}
          </span>
          <span className="text-xs text-gray-500">{match.match_size}</span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isConfirmed ? 'bg-blue-100 text-blue-700' :
            isCancelled ? 'bg-gray-100 text-gray-500' :
            'bg-green-50 text-green-600'
          }`}
        >
          {isConfirmed ? '매치확정' : isCancelled ? '취소됨' : '모집중 🟢'}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{match.team_name}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{match.description}</p>

      <div className="flex flex-col gap-1 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{match.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDateTime(match.match_datetime)}</span>
        </div>
        {match.profiles && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>
              {match.profiles.full_name}
              {match.profiles.department ? ` (${match.profiles.department})` : ''}
            </span>
          </div>
        )}
      </div>

      {!isOwner && !isCancelled && !isConfirmed && onApply && (
        <Button
          variant={hasApplied ? 'secondary' : 'primary'}
          size="sm"
          className="w-full"
          disabled={hasApplied}
          loading={applying}
          onClick={(e) => { e.preventDefault(); if (!hasApplied) onApply(match.id) }}
        >
          {hasApplied ? '신청 완료 ✓' : '매치 신청'}
        </Button>
      )}
      {isOwner && (
        <div className="text-xs text-center text-gray-400 py-1">내가 작성한 매치</div>
      )}
    </Link>
  )
}
