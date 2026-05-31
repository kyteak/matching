'use client'

import { MatchApplication } from '@/types/database'
import { LEVEL_COLORS } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

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
      {applications.map((app) => {
        const level = LEVEL_COLORS[app.profiles?.skill_level ?? '초급']
        return (
          <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{app.profiles?.nickname}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${level.bg} ${level.text}`}>
                  {app.profiles?.skill_level}
                </span>
              </div>
              <span className="text-xs text-gray-400">{app.matches?.team_name}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{app.matches?.sport} · {app.matches?.match_size}</p>
            <div className="flex gap-2">
              <Button
                variant="success"
                size="sm"
                className="flex-1"
                loading={processing === app.id}
                onClick={() => onAccept(app.id)}
              >
                신청 수락
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                loading={processing === app.id}
                onClick={() => onReject(app.id)}
              >
                신청 거절
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
