'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ContestMatch, ContestResume } from '@/types/database'
import { REGION_COLORS, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/Toast'
import { ChevronLeft, Calendar, Users, ChevronDown, ChevronUp, FileText, Star } from 'lucide-react'

type DetailData = {
  match: ContestMatch & { profiles?: { nickname: string; department: string } }
  authorResume: ContestResume | null
  teamResumes: (ContestResume & { profile?: { nickname: string; department: string } })[]
  isAuthor: boolean
  isAccepted: boolean
}

export default function ContestMatchDetailClient() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { toasts, addToast, removeToast } = useToast()

  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [expandedResumes, setExpandedResumes] = useState<Set<string>>(new Set(['author']))

  useEffect(() => {
    fetch(`/api/contest-matches/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
  }, [id])

  async function handleApply() {
    setApplying(true)
    try {
      const res = await fetch(`/api/contest-matches/${id}/apply`, { method: 'POST' })
      const d = await res.json()
      if (!res.ok) { addToast(d.error, 'error'); return }
      setHasApplied(true)
      addToast('팀 신청이 완료되었습니다!', 'success')
    } finally {
      setApplying(false)
    }
  }

  function toggleResume(key: string) {
    setExpandedResumes((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data || !data.match) {
    return <div className="text-center py-16 text-gray-400">모집 정보를 찾을 수 없습니다.</div>
  }

  const { match, authorResume, teamResumes, isAuthor, isAccepted } = data
  const region = REGION_COLORS[match.region as keyof typeof REGION_COLORS]
  const remaining = match.team_size - match.current_count
  const isClosed = match.status === '마감'
  const canSeeTeamResumes = isAuthor || isAccepted

  return (
    <div className="px-4 py-4 max-w-lg mx-auto pb-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 text-sm mb-4">
        <ChevronLeft className="w-4 h-4" />
        뒤로
      </button>

      {/* 매치 정보 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          {region && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${region.bg} ${region.text}`}>
              {region.emoji} {match.region}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
            isClosed ? 'bg-gray-100 text-gray-500' :
            remaining <= 1 ? 'bg-red-100 text-red-600' :
            remaining <= 2 ? 'bg-orange-100 text-orange-600' :
            'bg-green-100 text-green-700'
          }`}>
            {isClosed ? '마감' : `${remaining}자리 남음`}
          </span>
        </div>

        <h2 className="text-lg font-bold text-[#1E3A5F] mb-1">{match.contest_name}</h2>
        <p className="text-xs text-gray-500 mb-2">{match.contest_category}</p>
        {match.description && (
          <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{match.description}</p>
        )}

        <div className="flex flex-col gap-1 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>공모전 마감: {formatDate(match.deadline)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>모집 {match.current_count}/{match.team_size}명 · 팀장: {match.profiles?.nickname}</span>
          </div>
        </div>

        {!isAuthor && !isClosed && (
          <Button
            variant={hasApplied ? 'secondary' : 'primary'}
            className="w-full"
            disabled={hasApplied || remaining <= 0}
            loading={applying}
            onClick={handleApply}
          >
            {hasApplied ? '신청 완료 ✓' : remaining <= 0 ? '모집 마감' : '팀원 신청'}
          </Button>
        )}
        {isAuthor && (
          <div className="text-xs text-center text-gray-400 py-1">내가 작성한 모집</div>
        )}
      </div>

      {/* 팀장 자기소개서 */}
      <div className="mb-3">
        <button
          onClick={() => toggleResume('author')}
          className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1E3A5F]" />
            <div className="text-left">
              <p className="text-sm font-semibold text-[#1E3A5F]">팀장 자기소개서</p>
              <p className="text-xs text-gray-400">{match.profiles?.nickname} · {match.profiles?.department}</p>
            </div>
          </div>
          {expandedResumes.has('author')
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </button>
        {expandedResumes.has('author') && (
          <div className="bg-gray-50 rounded-b-2xl px-4 pb-4 pt-3 -mt-1 border border-t-0 border-gray-100">
            {authorResume
              ? <ResumeDetail resume={authorResume} />
              : <p className="text-xs text-gray-400 text-center py-3">자기소개서를 작성하지 않았습니다.</p>
            }
          </div>
        )}
      </div>

      {/* 팀원 자기소개서 (수락된 팀원 or 팀장만) */}
      {canSeeTeamResumes && teamResumes.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 font-medium mb-2 px-1">팀원 자기소개서</p>
          {teamResumes.map((r) => (
            <div key={r.user_id} className="mb-2">
              <button
                onClick={() => toggleResume(r.user_id)}
                className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF6B35]" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">{r.profile?.nickname ?? r.full_name}</p>
                    <p className="text-xs text-gray-400">{r.profile?.department ?? r.department}</p>
                  </div>
                </div>
                {expandedResumes.has(r.user_id)
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </button>
              {expandedResumes.has(r.user_id) && (
                <div className="bg-gray-50 rounded-b-2xl px-4 pb-4 pt-3 -mt-1 border border-t-0 border-gray-100">
                  <ResumeDetail resume={r} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {canSeeTeamResumes && teamResumes.length === 0 && (
        <div className="text-center text-xs text-gray-400 py-4">
          아직 수락된 팀원이 없습니다.
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

function ResumeDetail({ resume }: { resume: ContestResume }) {
  return (
    <div className="space-y-3 text-sm">
      <Row label="이름" value={resume.full_name} />
      <Row label="학과" value={resume.department} />
      <Row label="관심분야" value={resume.interests} />
      {resume.certifications && <Row label="보유 자격증" value={resume.certifications} />}
      <Row label="공모전 마음가짐" value={resume.mindset} />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-20 shrink-0">역할</span>
        <span className="text-xs bg-[#FF6B35] text-white px-2 py-0.5 rounded-full font-medium">{resume.preferred_role}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-20 shrink-0">수준</span>
        <div className="flex gap-0.5">
          {['초급', '중급', '고수'].map((l) => (
            <Star
              key={l}
              className={`w-3.5 h-3.5 ${
                (resume.skill_level === '초급' && l === '초급') ||
                (resume.skill_level === '중급' && (l === '초급' || l === '중급')) ||
                (resume.skill_level === '고수')
                  ? 'text-[#FF6B35] fill-[#FF6B35]'
                  : 'text-gray-200 fill-gray-200'
              }`}
            />
          ))}
          <span className="text-xs text-gray-600 ml-1">{resume.skill_level}</span>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
      <span className="text-xs text-gray-800 flex-1 whitespace-pre-wrap">{value}</span>
    </div>
  )
}
