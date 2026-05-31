'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DEPARTMENTS } from '@/lib/utils'

interface FormData {
  username: string
  password: string
  passwordConfirm: string
  fullName: string
  nickname: string
  studentId: string
  department: string
}

interface FormErrors {
  username?: string
  password?: string
  passwordConfirm?: string
  fullName?: string
  nickname?: string
  studentId?: string
  department?: string
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    username: '', password: '', passwordConfirm: '',
    fullName: '', nickname: '', studentId: '', department: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [usernameChecked, setUsernameChecked] = useState(false)
  const [nicknameChecked, setNicknameChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    if (field === 'username') setUsernameChecked(false)
    if (field === 'nickname') setNicknameChecked(false)
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!/^[a-z0-9]{4,20}$/.test(form.username))
      newErrors.username = '영문 소문자+숫자, 4~20자여야 합니다.'
    if (!/(?=.*[a-zA-Z])(?=.*\d).{8,}/.test(form.password))
      newErrors.password = '비밀번호는 8자 이상, 영문+숫자를 포함해야 합니다.'
    if (form.password !== form.passwordConfirm)
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    if (!/^[가-힣]{2,5}$/.test(form.fullName))
      newErrors.fullName = '올바른 이름을 입력해 주세요. (한글 2~5자)'
    if (form.nickname.length < 2 || form.nickname.length > 10)
      newErrors.nickname = '닉네임은 2~10자여야 합니다.'
    if (!/^\d{8}$/.test(form.studentId)) {
      newErrors.studentId = '학번은 8자리 숫자여야 합니다.'
    } else {
      const year = parseInt(form.studentId.slice(0, 4))
      if (year < 1990 || year > new Date().getFullYear())
        newErrors.studentId = '올바른 입학연도를 입력해 주세요.'
    }
    if (!form.department) newErrors.department = '학과를 선택해주세요.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function checkUsername() {
    if (!form.username) return
    const res = await fetch(`/api/auth/check-username?username=${form.username}`)
    const { available } = await res.json()
    if (!available) {
      setErrors((prev) => ({ ...prev, username: '이미 사용 중인 아이디입니다.' }))
    } else {
      setUsernameChecked(true)
      setErrors((prev) => ({ ...prev, username: undefined }))
    }
  }

  async function checkNickname() {
    if (!form.nickname) return
    const res = await fetch(`/api/auth/check-nickname?nickname=${form.nickname}`)
    const { available } = await res.json()
    if (!available) {
      setErrors((prev) => ({ ...prev, nickname: '이미 사용 중인 닉네임입니다.' }))
    } else {
      setNicknameChecked(true)
      setErrors((prev) => ({ ...prev, nickname: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return
    if (!usernameChecked) { setSubmitError('아이디 중복 확인을 해주세요.'); return }
    if (!nicknameChecked) { setSubmitError('닉네임 중복 확인을 해주세요.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error || '가입에 실패했습니다.'); return }
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">회원가입</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="아이디"
              placeholder="영문 소문자+숫자 4~20자"
              value={form.username}
              onChange={(e) => update('username', e.target.value)}
              error={errors.username}
              required
            />
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-6 flex-shrink-0" onClick={checkUsername}>
            {usernameChecked ? '✓' : '중복확인'}
          </Button>
        </div>

        <Input
          label="비밀번호"
          type="password"
          placeholder="8자 이상, 영문+숫자 포함"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          error={errors.password}
          required
        />
        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호 재입력"
          value={form.passwordConfirm}
          onChange={(e) => update('passwordConfirm', e.target.value)}
          error={errors.passwordConfirm}
          required
        />
        <Input
          label="이름 (실명)"
          placeholder="한글 2~5자"
          value={form.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          error={errors.fullName}
          required
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="닉네임"
              placeholder="2~10자"
              value={form.nickname}
              onChange={(e) => update('nickname', e.target.value)}
              error={errors.nickname}
              required
            />
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-6 flex-shrink-0" onClick={checkNickname}>
            {nicknameChecked ? '✓' : '중복확인'}
          </Button>
        </div>

        <Input
          label="학번"
          placeholder="8자리 숫자 (예: 20240001)"
          value={form.studentId}
          onChange={(e) => update('studentId', e.target.value.replace(/\D/g, '').slice(0, 8))}
          error={errors.studentId}
          maxLength={8}
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            소속 학과 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.department}
            onChange={(e) => update('department', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]"
            required
          >
            <option value="">학과 선택</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
        </div>

        {submitError && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>
        )}
        <Button type="submit" className="w-full" loading={loading}>
          가입하기
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-[#1E3A5F] font-medium hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
