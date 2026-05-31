export function cn(...inputs: (string | undefined | null | false | 0)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function maskStudentId(studentId: string): string {
  if (studentId.length <= 3) return studentId
  return studentId.slice(0, 3) + '*'.repeat(studentId.length - 3)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isExpiredContest(deadline: string): boolean {
  const deadlineDate = new Date(deadline)
  deadlineDate.setDate(deadlineDate.getDate() + 1)
  return deadlineDate < new Date()
}

export function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}시간 전`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}일 전`
}

export const SPORT_COLORS: Record<string, { bg: string; text: string; emoji: string }> = {
  축구: { bg: 'bg-green-100', text: 'text-green-700', emoji: '⚽' },
  풋살: { bg: 'bg-blue-100', text: 'text-blue-700', emoji: '🥅' },
  농구: { bg: 'bg-orange-100', text: 'text-orange-700', emoji: '🏀' },
  'e스포츠': { bg: 'bg-purple-100', text: 'text-purple-700', emoji: '🎮' },
}

export const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  초급: { bg: 'bg-green-100', text: 'text-green-700' },
  중급: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  고수: { bg: 'bg-red-100', text: 'text-red-600' },
}

export const REGION_COLORS: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
  충청북도: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', emoji: '🏔️' },
  충청남도: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', emoji: '🌊' },
  세종특별자치시: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', emoji: '🏛️' },
  대전광역시: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', emoji: '⚗️' },
}

export const DEPARTMENTS = [
  // 인문대학
  '고고미술사학과', '국어국문학과', '글로벌K컬처학과', '독일언어문화학과',
  '러시아언어문화학과', '사학과', '영어영문학과', '인문학자율전공학부',
  '중어중문학과', '철학과', '프랑스언어문화학과',
  // 사회과학대학
  '경제학과', '사회과학자율전공학부', '사회학과', '심리학과',
  '정치외교학과', '행정학과',
  // 경영대학
  '경영정보학과', '경영학부', '경영학자율전공학부', '국제경영학과',
  // 자연과학대학
  '미생물학과', '물리학과', '생물학과', '생화학과', '수학과',
  '자연과학자율전공학부', '정보통계학과', '지구환경과학과', '천문우주학과', '화학과',
  // 공과대학
  '건축공학과', '건축학과', '공업화학과', '공학자율전공학부', '기계공학부',
  '도시공학과', '신소재공학과', '안전공학과', '토목공학부', '화학공학과', '환경공학과',
  // 전자정보대학
  '반도체공학부', '소프트웨어학부', '전기공학부', '전자공학과',
  '정보통신공학부', '지능로봇공학과', '컴퓨터공학과',
  // 농업생명환경대학
  '농업경제학과', '농업생명환경자율전공학부', '목재·종이과학과', '바이오시스템공학과',
  '산림학과', '식물의학과', '식물자원학과', '식품생명공학과', '축산학과',
  '특용식물학과', '원예과학과', '지역건설공학과', '환경생명화학과',
  // 사범대학
  '교육학과', '국어교육과', '물리교육과', '사회교육과', '생물교육과',
  '수학교육과', '역사교육과', '영어교육과', '윤리교육과',
  '지구과학교육과', '지리교육과', '체육교육과', '화학교육과',
  // 생활과학대학
  '아동복지학과', '소비자학과', '식품영양학과', '의류학과', '주거환경학과',
  // 수의과대학
  '수의예과', '수의학과',
  // 약학대학
  '약학과', '제약학과',
  // 의과대학
  '의예과', '의학과',
  // 간호대학
  '간호학과',
  // 창의융합대학
  '바이오헬스학부', '자율전공학부',
  // 예술학과군
  '디자인학과', '미술학과',
  '기타',
]

export const SPORT_ALLOWED_SIZES: Record<string, string[]> = {
  축구: ['5vs5', '11vs11'],
  풋살: ['3vs3', '5vs5'],
  농구: ['3vs3', '5vs5'],
  'e스포츠': ['1vs1', '3vs3', '5vs5'],
}
