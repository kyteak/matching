'use client'

import Link from 'next/link'
import { ContestMatch } from '@/types/database'
import { REGION_COLORS, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Calendar, Users } from 'lucide-react'

interface ContestMatchCardProps {
  contest: ContestMatch
  currentUserId?: string
  hasApplied?: boolean
  onApply?: (id: string) => void
  applying?: boolean
}

export function ContestMatchCard({
  contest,
  currentUserId,
  hasApplied,
  onApply,
  applying,
}: ContestMatchCardProps) {
  const remaining = contest.team_size - contest.current_count
  const isOwner = contest.author_id === currentUserId
  const isClosed = contest.status === '마감'
  const region = REGION_COLORS[contest.region]

  const remainingColor =
    remaining <= 1 ? 'bg-red-100 text-red-600' :
    remaining <= 2 ? 'bg-orange-100 text-orange-600' :
    'bg-green-100 text-green-700'

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${region?.bg} ${region?.text}`}>
          {region?.emoji} {contest.region}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-bold ${isClosed ? 'bg-gray-100 text-gray-500' : remainingColor}`}>
          {isClosed ? '마감' : `${remaining}자리 남음`}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{contest.contest_name}</h3>
      <p className="text-xs text-gray-500 mb-1">{contest.contest_category}</p>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{contest.description}</p>

      <div className="flex flex-col gap-1 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>마감: {formatDate(contest.deadline)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>모집 {contest.current_count}/{contest.team_size}명 · {contest.profiles?.nickname}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/contest/matches/${contest.id}`}
          className="flex-1 text-center text-xs py-2 rounded-lg border border-[#1E3A5F] text-[#1E3A5F] font-medium hover:bg-blue-50 transition-colors"
        >
          상세 보기
        </Link>
        {!isOwner && !isClosed && onApply && (
          <Button
            variant={hasApplied ? 'secondary' : 'primary'}
            size="sm"
            className="flex-1"
            disabled={hasApplied || remaining <= 0}
            loading={applying}
            onClick={() => !hasApplied && onApply(contest.id)}
          >
            {hasApplied ? '신청 완료 ✓' : remaining <= 0 ? '모집 마감' : '팀원 신청'}
          </Button>
        )}
        {isOwner && (
          <div className="flex-1 text-xs text-center text-gray-400 py-2">내가 작성한 모집</div>
        )}
      </div>
    </div>
  )
}
