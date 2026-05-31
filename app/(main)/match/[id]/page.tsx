'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Match, MatchApplication } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PendingApplications } from '@/components/match/PendingApplications'
import { Toast, useToast } from '@/components/Toast'
import { formatDateTime, SPORT_COLORS, LEVEL_COLORS, SPORT_ALLOWED_SIZES } from '@/lib/utils'
import { MapPin, Calendar, ChevronLeft, Trash2, Pencil } from 'lucide-react'

const SPORTS = ['축구', '풋살', '농구', '테니스', '배드민턴', '탁구', 'e스포츠']
const LEVELS = ['초급', '중급', '고수']

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const { toasts, addToast, removeToast } = useToast()

  const [match, setMatch] = useState<Match | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [hasApplied, setHasApplied] = useState(false)
  const [applications, setApplications] = useState<MatchApplication[]>([])
  const [applying, setApplying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    teamName: '', sport: '', matchSize: '', requiredLevel: '',
    location: '', matchDatetime: '', description: '',
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: { user } }, matchRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch(`/api/matches/${id}`),
      ])
      if (!matchRes.ok) { router.push('/match'); return }
      const matchData = await matchRes.json()
      setMatch(matchData)
      setEditForm({
        teamName: matchData.team_name,
        sport: matchData.sport,
        matchSize: matchData.match_size,
        requiredLevel: matchData.required_level,
        location: matchData.location,
        matchDatetime: matchData.match_datetime?.slice(0, 16) ?? '',
        description: matchData.description ?? '',
      })
      if (user) {
        setCurrentUserId(user.id)
        const { data: apps } = await supabase
          .from('match_applications')
          .select('*, profiles(id, nickname, skill_level)')
          .eq('match_id', id)
        setApplications(apps ?? [])
        setHasApplied(
          (apps ?? []).some((a) => a.applicant_id === user.id && a.status !== 'rejected')
        )
      }
      setLoading(false)
    }
    load()
  }, [id])

  function setEdit(key: string, value: string) {
    setEditForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'sport') next.matchSize = ''
      return next
    })
  }

  async function handleApply() {
    setApplying(true)
    try {
      const res = await fetch(`/api/matches/${id}/apply`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { addToast(data.error, 'error'); return }
      setHasApplied(true)
      addToast('매치 신청이 완료되었습니다!', 'success')
    } finally {
      setApplying(false)
    }
  }

  async function handleWithdraw() {
    const myApp = applications.find(
      (a) => a.applicant_id === currentUserId && a.status === 'pending'
    )
    if (!myApp) return
    const res = await fetch(`/api/applications/${myApp.id}/withdraw`, { method: 'DELETE' })
    if (res.ok) {
      setHasApplied(false)
      setApplications((prev) => prev.filter((a) => a.id !== myApp.id))
      addToast('신청을 취소했습니다.', 'success')
    }
  }

  async function handleDelete() {
    if (!confirm('매치를 삭제하시겠습니까?')) return
    setDeleting(true)
    const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/match')
    } else {
      const data = await res.json()
      addToast(data.error, 'error')
      setDeleting(false)
    }
  }

  async function handleSave() {
    if (!editForm.teamName || !editForm.sport || !editForm.matchSize || !editForm.requiredLevel || !editForm.location || !editForm.matchDatetime) {
      addToast('모든 필드를 입력해주세요.', 'error'); return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: editForm.teamName,
          sport: editForm.sport,
          match_size: editForm.matchSize,
          required_level: editForm.requiredLevel,
          location: editForm.location,
          match_datetime: editForm.matchDatetime,
          description: editForm.description,
        }),
      })
      const data = await res.json()
      if (!res.ok) { addToast(data.error, 'error'); return }
      setMatch(data)
      setEditing(false)
      addToast('매치가 수정되었습니다.', 'success')
    } finally {
      setSaving(false)
    }
  }

  async function handleAccept(applicationId: string) {
    const res = await fetch(`/api/applications/${applicationId}/accept`, { method: 'PATCH' })
    const data = await res.json()
    if (!res.ok) { addToast(data.error, 'error'); return }
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: 'accepted' } : a))
    )
    if (data.confirmed) {
      setMatch((prev) => prev ? { ...prev, status: '매치확정' } : prev)
    }
    addToast('신청을 수락했습니다.', 'success')
  }

  async function handleReject(applicationId: string) {
    const res = await fetch(`/api/applications/${applicationId}/reject`, { method: 'PATCH' })
    if (!res.ok) { addToast('오류가 발생했습니다.', 'error'); return }
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: 'rejected' } : a))
    )
    addToast('신청을 거절했습니다.', 'success')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!match) return null

  const isAuthor = currentUserId === match.author_id
  const pendingApps = applications.filter((a) => a.status === 'pending')
  const myPendingApp = applications.find(
    (a) => a.applicant_id === currentUserId && a.status === 'pending'
  )
  const sport = SPORT_COLORS[match.sport]
  const level = LEVEL_COLORS[match.required_level]
  const editAllowedSizes = SPORT_ALLOWED_SIZES[editForm.sport] ?? []
  const minDatetime = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 text-sm">
        <ChevronLeft className="w-4 h-4" />
        뒤로
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold text-[#1E3A5F] flex-1">{match.team_name}</h1>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            match.status === '매치확정' ? 'bg-blue-100 text-blue-700' :
            match.status === '취소됨' ? 'bg-gray-100 text-gray-500' :
            'bg-green-50 text-green-600'
          }`}>
            {match.status}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${sport?.bg} ${sport?.text}`}>
            {sport?.emoji} {match.sport}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${level?.bg} ${level?.text}`}>
            {match.required_level}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {match.match_size}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1E3A5F]" />
            <span>{formatDateTime(match.match_datetime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1E3A5F]" />
            <span>{match.location}</span>
          </div>
        </div>

        {match.description && (
          <p className="text-sm text-gray-700 border-t pt-3 whitespace-pre-wrap">{match.description}</p>
        )}
      </div>

      {isAuthor ? (
        <>
          {pendingApps.length > 0 && (
            <PendingApplications
              applications={pendingApps}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditing(true)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              수정
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              loading={deleting}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              삭제
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          {match.status === '모집중' && !hasApplied && (
            <Button variant="primary" className="w-full" onClick={handleApply} loading={applying}>
              매치 신청하기
            </Button>
          )}
          {hasApplied && myPendingApp && (
            <Button variant="secondary" className="w-full" onClick={handleWithdraw}>
              신청 취소
            </Button>
          )}
          {hasApplied && !myPendingApp && (
            <p className="text-center text-sm text-green-600 font-medium py-3">
              신청이 수락되었습니다!
            </p>
          )}
          {match.status !== '모집중' && !hasApplied && (
            <p className="text-center text-sm text-gray-400 py-3">모집이 마감된 매치입니다.</p>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <h2 className="font-bold text-[#1E3A5F] text-lg">매치 수정</h2>

            <Input
              label="팀 이름"
              value={editForm.teamName}
              onChange={(e) => setEdit('teamName', e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종목</label>
              <div className="flex gap-2 flex-wrap">
                {SPORTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEdit('sport', s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      editForm.sport === s
                        ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {editForm.sport && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">매치 형태</label>
                <div className="flex gap-2 flex-wrap">
                  {editAllowedSizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEdit('matchSize', s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        editForm.matchSize === s
                          ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                          : 'bg-white text-gray-600 border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">실력 수준</label>
              <div className="flex gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setEdit('requiredLevel', l)}
                    className={`flex-1 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      editForm.requiredLevel === l
                        ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="장소"
              value={editForm.location}
              onChange={(e) => setEdit('location', e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">매치 일시</label>
              <input
                type="datetime-local"
                min={minDatetime}
                value={editForm.matchDatetime}
                onChange={(e) => setEdit('matchDatetime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상세 설명 (선택)</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEdit('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] text-sm resize-none"
              />
            </div>

            <div className="flex gap-2 pb-2">
              <Button variant="secondary" className="flex-1" onClick={() => setEditing(false)}>취소</Button>
              <Button variant="primary" className="flex-1" onClick={handleSave} loading={saving}>저장</Button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
