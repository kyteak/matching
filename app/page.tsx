import Link from 'next/link'
import { Swords, Trophy, MessageSquare, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1E3A5F] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-white text-center">
        <h1 className="text-4xl font-bold mb-3">충북match</h1>
        <p className="text-blue-200 text-lg mb-2">충북대학교 전용</p>
        <p className="text-blue-100 mb-10 text-sm leading-relaxed">
          스포츠 매치 상대를 찾고,<br />
          공모전 팀원을 모집하세요
        </p>

        <div className="grid grid-cols-2 gap-4 mb-12 w-full max-w-xs">
          {[
            { icon: Swords, label: '스포츠 매칭', desc: '종목·수준별 상대 찾기' },
            { icon: Trophy, label: '공모전 팀빌딩', desc: '충청권 공모전 모집' },
            { icon: MessageSquare, label: '실시간 채팅', desc: '매치 확정 즉시 대화' },
            { icon: Star, label: '매너 평가', desc: '신뢰 기반 커뮤니티' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 text-left">
              <Icon className="w-6 h-6 mb-2 text-[#FF6B35]" />
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-blue-200 mt-1">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/login"
            className="bg-[#FF6B35] text-white py-3 rounded-xl font-semibold text-center hover:bg-orange-500 transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="bg-white/20 text-white py-3 rounded-xl font-semibold text-center hover:bg-white/30 transition-colors"
          >
            회원가입
          </Link>
        </div>

        <p className="mt-8 text-blue-300 text-xs">충북대학교 재학생 전용 서비스</p>
      </div>
    </div>
  )
}
