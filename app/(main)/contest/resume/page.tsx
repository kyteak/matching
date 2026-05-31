'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toast, useToast } from '@/components/Toast'
import { DEPARTMENTS } from '@/lib/utils'
import { ChevronLeft, FileText } from 'lucide-react'

const LEVELS = ['초급', '중급', '고수']
const ROLES = ['기획', '디자인', '개발', '마케팅', '영상/미디어', '발표/PT', '조사/분석', '기타']

type Form = {
  full_name: string
  department: string
  interests: string
  certifications: string
  mindset: string
  preferred_role: string
  skill_level: string
}

const EMPTY: Form = {
  full_name: '', department: '', interests: '',
  certifications: '', mindset: '', preferred_role: '', skill_level: '',
}

export default function ContestResumePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromProfile = searchParams.get('from') === 'profile'
  const supabase = createClient()
  const { toasts, addToast, removeToast } = useToast()

  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [profileRes, resumeRes] = await Promise.all([
        supabase.from('profiles').select('full_name, department').eq('id', user.id).single(),
        fetch('/api/contest-resume'),
      ])

      const resumeData = resumeRes.ok ? await resumeRes.json() : null

      if (resumeData) {
        setForm({
          full_name: resumeData.full_name,
          department: resumeData.department,
          interests: resumeData.interests,
          certifications: resumeData.certifications ?? '',
          mindset: resumeData.mindset,
          preferred_role: resumeData.preferred_role,
          skill_level: resumeData.skill_level,
        })
      } else if (profileRes.data) {
        setForm((prev) => ({
          ...prev,
          full_name: profileRes.data.full_name ?? '',
          department: profileRes.data.department ?? '',
        }))
      }
      setLoading(false)
    }
    load()
  }, [])

  function set(key: keyof Form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.full_name.trim() || !form.department || !form.interests.trim() ||
        !form.mindset.trim() || !form.preferred_role || !form.skill_level) {
      addToast('필수 항목을 모두 입력해주세요.', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/contest-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { addToast(data.error, 'error'); return }

      if (fromProfile) {
        addToast('자기소개서가 저장되었습니다.', 'success')
        setTimeout(() => router.back(), 800)
      } else {
        router.push('/contest/matches')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto pb-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 text-sm mb-4">
        <ChevronLeft className="w-4 h-4" />
        뒤로
      </button>

      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-5 h-5 text-[#1E3A5F]" />
        <h1 className="text-lg font-bold text-[#1E3A5F]">공모전 자기소개서</h1>
      </div>
      {!fromProfile && (
        <p className="text-xs text-gray-400 mb-5">팀 모집에 참여하려면 자기소개서를 먼저 작성해주세요.</p>
      )}

      <div className="space-y-5 mt-4">
        {/* 이름 */}
        <Input
          label="이름 *"
          value={form.full_name}
          onChange={(e) => set('full_name', e.target.value)}
          placeholder="본명을 입력해주세요"
        />

        {/* 학과 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학과 *</label>
          <select
            value={form.department}
            onChange={(e) => set('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          >
            <option value="">학과 선택</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* 관심분야 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">관심분야 *</label>
          <textarea
            rows={2}
            value={form.interests}
            onChange={(e) => set('interests', e.target.value)}
            placeholder="예) AI, 환경, 사회문제, 창업, 디자인 등"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] resize-none"
          />
        </div>

        {/* 보유 자격증 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">보유 자격증 <span className="text-gray-400 font-normal">(선택)</span></label>
          <textarea
            rows={2}
            value={form.certifications}
            onChange={(e) => set('certifications', e.target.value)}
            placeholder="예) 정보처리기사, TOEIC 850, 운전면허 등 (없으면 비워두세요)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] resize-none"
          />
        </div>

        {/* 마음가짐 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">공모전에 임하는 마음가짐 *</label>
          <textarea
            rows={3}
            value={form.mindset}
            onChange={(e) => set('mindset', e.target.value)}
            placeholder="공모전에 어떤 자세로 임하는지 적어주세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] resize-none"
          />
        </div>

        {/* 자신 있는 역할 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">팀 내 자신 있는 역할 *</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => set('preferred_role', r)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  form.preferred_role === r
                    ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 수준 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">본인 수준 *</label>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => set('skill_level', l)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.skill_level === l
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" className="w-full" onClick={handleSave} loading={saving}>
          {fromProfile ? '저장하기' : '작성 완료 → 팀 모집 보기'}
        </Button>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
