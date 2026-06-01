'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/Toast'

const CATEGORIES = ['IT·과학', '디자인·미술', '사진·영상', '예술·공연', '사회·봉사', '창업·경영', '기타']
const REGIONS = ['충청북도', '충청남도', '세종특별자치시', '대전광역시', '기타']
const TEAM_SIZES = [2, 3, 4, 5, 6]

export default function ContestWritePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toasts, addToast, removeToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    contestName: searchParams.get('title') ?? '',
    contestCategory: '',
    region: searchParams.get('region') ?? '',
    deadline: searchParams.get('deadline') ?? '',
    teamSize: 3,
    description: '',
  })

  function set(key: string, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.contestName || !form.contestCategory || !form.region || !form.deadline) {
      addToast('필수 항목을 모두 입력해주세요.', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/contest-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { addToast(data.error, 'error'); return }
      router.push('/contest/matches')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-[#1E3A5F] mb-6">팀 모집 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="공모전 이름"
          placeholder="예) 2024 충북대 창업경진대회"
          value={form.contestName}
          onChange={(e) => set('contestName', e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('contestCategory', c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.contestCategory === c
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#1E3A5F]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
          <div className="flex gap-2 flex-wrap">
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => set('region', r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.region === r
                    ? 'bg-[#C41230] text-white border-[#C41230]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#C41230]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">공모전 마감일</label>
          <input
            type="date"
            min={today}
            value={form.deadline}
            onChange={(e) => set('deadline', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            모집 인원 (팀장 포함)
          </label>
          <div className="flex gap-2">
            {TEAM_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set('teamSize', n)}
                className={`w-12 h-10 rounded-lg text-sm font-medium border transition-colors ${
                  form.teamSize === n
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#1E3A5F]'
                }`}
              >
                {n}명
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상세 설명 (선택)</label>
          <textarea
            rows={5}
            placeholder="공모전 내용, 원하는 팀원 역할, 연락 방법 등을 입력하세요."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] text-sm resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" variant="primary" className="flex-1" loading={loading}>
            등록하기
          </Button>
        </div>
      </form>
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
