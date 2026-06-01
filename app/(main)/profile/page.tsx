'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile, Match, Review, SkillLevel } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/review/StarRating'
import { Toast, useToast } from '@/components/Toast'
import { Input } from '@/components/ui/Input'
import { DEPARTMENTS } from '@/lib/utils'
import { formatDateTime, maskStudentId } from '@/lib/utils'
import { User, Star, Settings, LogOut, FileText } from 'lucide-react'
import { ContestResume } from '@/types/database'

type Tab = 'info' | 'matches' | 'reviews' | 'settings'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { toasts, addToast, removeToast } = useToast()

  const [tab, setTab] = useState<Tab>('info')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myMatches, setMyMatches] = useState<Match[]>([])
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ nickname: '', department: '', skill_level: '' })
  const [resume, setResume] = useState<ContestResume | null>(null)
  const [resumeOpen, setResumeOpen] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (prof) {
        setProfile(prof)
        setEditForm({
          nickname: prof.nickname,
          department: prof.department ?? '',
          skill_level: prof.skill_level ?? '',
        })
      }
      const resumeRes = await fetch('/api/contest-resume')
      if (resumeRes.ok) {
        const resumeData = await resumeRes.json()
        setResume(resumeData)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!profile) return
    if (tab === 'matches') {
      supabase
        .from('matches')
        .select('*')
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setMyMatches(data ?? []))
    }
    if (tab === 'reviews') {
      supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', profile.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setMyReviews(data ?? []))
    }
  }, [tab, profile])

  async function handleSave() {
    if (!editForm.nickname.trim()) { addToast('닉네임을 입력해주세요.', 'error'); return }
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        nickname: editForm.nickname.trim(),
        department: editForm.department || null,
        skill_level: editForm.skill_level || null,
      })
      .eq('id', profile!.id)
    setSaving(false)
    if (error) { addToast(error.message, 'error'); return }
    setProfile((prev) => prev ? { ...prev, ...editForm, skill_level: editForm.skill_level as SkillLevel } : prev)
    setEditing(false)
    addToast('프로필이 저장되었습니다.', 'success')
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!profile) return null

  const avgRating = myReviews.length
    ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length
    : 0

  const TABS: { key: Tab; label: string }[] = [
    { key: 'info', label: '내 정보' },
    { key: 'matches', label: '내 매치' },
    { key: 'reviews', label: '리뷰' },
    { key: 'settings', label: '설정' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#1E3A5F] text-white px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold">{profile.nickname}</p>
            <p className="text-sm text-white/70">@{profile.username}</p>
            {profile.skill_level && (
              <span className="text-xs text-[#C41230] font-medium">{profile.skill_level}</span>
            )}
          </div>
        </div>
        {tab === 'reviews' && myReviews.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <StarRating value={Math.round(avgRating)} readonly size="sm" />
            <span className="text-sm text-white/80">{avgRating.toFixed(1)} ({myReviews.length}개)</span>
          </div>
        )}
      </div>

      <div className="flex border-b bg-white">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              tab === t.key
                ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]'
                : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tab === 'info' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
              <InfoRow label="이름" value={profile.full_name} />
              <InfoRow label="아이디" value={`@${profile.username}`} />
              <InfoRow label="학번" value={maskStudentId(profile.student_id)} />
              <InfoRow label="학과" value={profile.department ?? '미설정'} />
              <InfoRow label="실력" value={profile.skill_level ?? '미설정'} />
            </div>
            <Button variant="outline" className="w-full" onClick={() => setEditing(true)}>
              프로필 수정
            </Button>

            {/* 공모전 자기소개서 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1E3A5F]" />
                  <span className="text-sm font-semibold text-[#1E3A5F]">공모전 자기소개서</span>
                </div>
                <button
                  onClick={() => router.push('/contest/resume?from=profile')}
                  className="text-xs text-[#C41230] font-medium"
                >
                  {resume ? '수정' : '작성하기'}
                </button>
              </div>
              {resume ? (
                <div className="space-y-2 text-sm">
                  <ResumeRow label="관심분야" value={resume.interests} />
                  <ResumeRow label="자신 있는 역할" value={resume.preferred_role} />
                  <ResumeRow label="수준" value={resume.skill_level} />
                  {resume.certifications && <ResumeRow label="자격증" value={resume.certifications} />}
                  <ResumeRow label="마음가짐" value={resume.mindset} />
                </div>
              ) : (
                <p className="text-xs text-gray-400">팀 모집 참여를 위한 자기소개서가 없습니다.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'matches' && (
          <div className="space-y-3">
            {myMatches.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">등록한 매치가 없습니다.</p>
            ) : (
              myMatches.map((m) => (
                <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#1E3A5F] text-sm truncate flex-1">{m.team_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      m.status === '모집중' ? 'bg-green-50 text-green-600' :
                      m.status === '매치확정' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{m.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(m.match_datetime)}</p>
                  <p className="text-xs text-gray-400">{m.location}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-3">
            {myReviews.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">받은 리뷰가 없습니다.</p>
            ) : (
              myReviews.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <StarRating value={r.rating} readonly size="sm" />
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">로그아웃</span>
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-5 space-y-4">
            <h2 className="font-bold text-[#1E3A5F]">프로필 수정</h2>
            <Input
              label="닉네임"
              value={editForm.nickname}
              onChange={(e) => setEditForm((p) => ({ ...p, nickname: e.target.value }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">학과</label>
              <select
                value={editForm.department}
                onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              >
                <option value="">선택 안함</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">실력 수준</label>
              <div className="flex gap-2">
                {['초급', '중급', '고수'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setEditForm((p) => ({ ...p, skill_level: l }))}
                    className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                      editForm.skill_level === l
                        ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                        : 'border-gray-300 text-gray-600'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-[#1E3A5F]">{value}</span>
    </div>
  )
}

function ResumeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 shrink-0 w-24">{label}</span>
      <span className="text-gray-700 font-medium break-all">{value}</span>
    </div>
  )
}
