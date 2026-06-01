'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const email = `${form.username}@cbnu.match`
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      })
      if (authError) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.')
        return
      }
      router.push('/home')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">로그인</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="아이디"
          placeholder="영문 소문자+숫자"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호 입력"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          로그인
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-[#1E3A5F] font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}
