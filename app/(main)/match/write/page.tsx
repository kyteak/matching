'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/Toast'
import { SPORT_ALLOWED_SIZES } from '@/lib/utils'

const SPORTS = ['축구', '풋살', '농구', '테니스', '배드민턴', '탁구', 'e스포츠']
const LEVELS = ['초급', '중급', '고수']

export default function MatchWritePage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    teamName: '',
    sport: '',
    matchSize: '',
    requiredLevel: '',
    location: '',
    matchDatetime: '',
    description: '',
  })

  const allowedSizes: string[] = form.sport
    ? (SPORT_ALLOWED_SIZES[form.sport] ?? ['1vs1', '3vs3', '5vs5', '11vs11'])
    : []

  function set(key: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'sport') next.matchSize = ''
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.sport || !form.matchSize || !form.requiredLevel || !form.location || !form.matchDatetime || !form.teamName) {
      addToast('모든 필드를 입력해주세요.', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { addToast(data.error, 'error'); return }
      router.push('/match')
    } finally {
      setLoading(false)
    }
  }

  const minDatetime = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <div className="px-5 py-8 max-w-lg mx-auto pb-24">
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-8">매치 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-7">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">팀 이름</label>
          <input
            type="text"
            placeholder="예) 충북대 축구팀"
            value={form.teamName}
            onChange={(e) => set('teamName', e.target.value)}
            required
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">종목</label>
          <div className="grid grid-cols-4 gap-2">
            {SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set('sport', s)}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  form.sport === s
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1E3A5F]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {form.sport && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">매치 형태</label>
            <div className="grid grid-cols-4 gap-2">
              {allowedSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('matchSize', s)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    form.matchSize === s
                      ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#FF6B35]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">실력 수준</label>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => set('requiredLevel', l)}
                className={`py-3.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  form.requiredLevel === l
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1E3A5F]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">장소</label>
          <input
            type="text"
            placeholder="예) 충북대 운동장 제1구장"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            required
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">매치 일시</label>
          <input
            type="datetime-local"
            min={minDatetime}
            value={form.matchDatetime}
            onChange={(e) => set('matchDatetime', e.target.value)}
            required
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">상세 설명 <span className="text-gray-400 font-normal">(선택)</span></label>
          <textarea
            rows={5}
            placeholder="매치에 대한 추가 정보를 입력하세요."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] text-base resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-300 text-gray-600 font-bold text-base transition-colors hover:border-gray-400"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 rounded-2xl bg-[#1E3A5F] text-white font-bold text-base transition-colors hover:bg-[#162d4a] disabled:opacity-60"
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
