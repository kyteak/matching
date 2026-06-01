'use client'

import { MatchApplication } from '@/types/database'
import { LEVEL_COLORS } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { User, BookOpen } from 'lucide-react'

interface PendingApplicationsProps {
  applications: MatchApplication[]
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  processing?: string | null
  readOnly?: boolean
}

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  pending:  { label: '검토 중',  bg: 'bg-yellow-50',  text: 'text-yellow-600' },
  accepted: { label: '수락됨',   bg: 'bg-green-50',   text: 'text-green-600'  },
  rejected: { label: '거절됨',   bg: 'bg-red-50',     text: 'text-red-500'    },
}

export function PendingApplications({
  applications,
  onAccept,
  onReject,
  processing,
  readOnly = false,
}: PendingApplicationsProps) {
  const shown = readOnly
    ? applications
    : applications.filter((a) => a.status === 'pending')

  if (shown.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        {readOnly ? '신청자가 없습니다.' : '아직 들어온 신청이 없습니다.'}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">
        신청자 목록 ({shown.length}명)
      </h3>
      {shown.map((app) => {
        const level = LEVEL_COLORS[app.profiles?.skill_level ?? '초급']
        const status = STATUS_STYLE[app.status] ?? STATUS_STYLE.pending
        const displayName = app.profiles?.full_name || app.profiles?.nickname || '알 수 없음'

        return (
          <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
                </div>
                {app.profiles?.department && (
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-500">{app.profiles.department}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${level.bg} ${level.text}`}>
                    {app.profiles?.skill_level}
                  </span>
                  {readOnly && (
                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!readOnly && app.status === 'pending' && onAccept && onReject && (
              <div className="flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  className="flex-1"
                  loading={processing === app.id}
                  onClick={() => onAccept(app.id)}
                >
                  수락
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  loading={processing === app.id}
                  onClick={() => onReject(app.id)}
                >
                  거절
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
