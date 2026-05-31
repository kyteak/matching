'use client'

import { MatchApplication } from '@/types/database'
import { LEVEL_COLORS } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { User, BookOpen } from 'lucide-react'

interface PendingApplicationsProps {
  applications: MatchApplication[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
  processing?: string | null
}

export function PendingApplications({
  applications,
  onAccept,
  onReject,
  processing,
}: PendingApplicationsProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        아직 들어온 신청이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">신청자 목록 ({applications.length}명)</h3>
      {applications.map((app) => {
        const level = LEVEL_COLORS[app.profiles?.skill_level ?? '초급']
        const displayName = app.profiles?.full_name || app.profiles?.nickname || '알 수 없음'
        return (
          <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
                </div>
                {app.profiles?.department && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-500">{app.profiles.department}</p>
                  </div>
                )}
                <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${level.bg} ${level.text}`}>
                  {app.profiles?.skill_level}
                </span>
              </div>
            </div>
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
          </div>
        )
      })}
    </div>
  )
}
