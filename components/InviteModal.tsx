'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { X, UserPlus } from 'lucide-react'

type Invitable = {
  applicant_id: string
  profiles: { id: string; nickname: string; skill_level: string } | null
}

export function InviteModal({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const [invitable, setInvitable] = useState<Invitable[]>([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState<string | null>(null)
  const [invited, setInvited] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`/api/contest-rooms/${roomId}/invite`)
      .then((r) => r.json())
      .then((d) => setInvitable(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [roomId])

  async function invite(userId: string) {
    setInviting(userId)
    try {
      const res = await fetch(`/api/contest-rooms/${roomId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) setInvited((prev) => new Set([...prev, userId]))
    } finally {
      setInviting(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 max-h-[60vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1E3A5F]">팀원 초대</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-3 border-[#1E3A5F] border-t-transparent rounded-full" />
            </div>
          ) : invitable.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">초대할 수 있는 팀원이 없습니다.</p>
          ) : (
            invitable.map((item) => {
              const profile = item.profiles
              if (!profile) return null
              const isInvited = invited.has(item.applicant_id)
              return (
                <div key={item.applicant_id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-[#1E3A5F]">{profile.nickname}</p>
                    <p className="text-xs text-gray-400">{profile.skill_level}</p>
                  </div>
                  <Button
                    variant={isInvited ? 'secondary' : 'primary'}
                    onClick={() => !isInvited && invite(item.applicant_id)}
                    loading={inviting === item.applicant_id}
                    className="text-xs px-3 py-1.5"
                  >
                    {isInvited ? '초대됨' : (
                      <>
                        <UserPlus className="w-3 h-3 mr-1" />
                        초대
                      </>
                    )}
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
