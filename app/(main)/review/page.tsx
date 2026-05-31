'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { StarRating } from '@/components/review/StarRating'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/Toast'
import { ChevronLeft } from 'lucide-react'

function ReviewForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const revieweeId = searchParams.get('userId')
  const matchId = searchParams.get('matchId')
  const { toasts, addToast, removeToast } = useToast()

  const [rating, setRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { addToast('별점을 선택해주세요.', 'error'); return }
    if (!revieweeId || !matchId) { addToast('잘못된 접근입니다.', 'error'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, revieweeId, rating }),
      })
      const data = await res.json()
      if (!res.ok) { addToast(data.error, 'error'); return }
      addToast('리뷰가 등록되었습니다!', 'success')
      setTimeout(() => router.back(), 1200)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 text-sm mb-6">
        <ChevronLeft className="w-4 h-4" />
        뒤로
      </button>

      <h1 className="text-xl font-bold text-[#1E3A5F] mb-2">매치 후기 작성</h1>
      <p className="text-sm text-gray-500 mb-8">함께한 매치는 어떠셨나요?</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
        <p className="text-center text-sm text-gray-400">
          {rating === 0 ? '별점을 선택해주세요' :
           rating === 1 ? '😞 별로였어요' :
           rating === 2 ? '😕 아쉬웠어요' :
           rating === 3 ? '😊 보통이에요' :
           rating === 4 ? '😄 좋았어요' :
           '🤩 최고였어요'}
        </p>

        <Button type="submit" variant="primary" className="w-full" loading={submitting}>
          리뷰 등록
        </Button>
      </form>
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
      </div>
    }>
      <ReviewForm />
    </Suspense>
  )
}
