import Link from 'next/link'
import { Swords, Trophy, MessageSquare, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #C41230 0%, #8B0D22 60%, #1E3A5F 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-white text-center">

        <div className="mb-2">
          <span className="text-5xl font-black tracking-tight">충북</span>
          <span className="text-5xl font-black tracking-tight text-[#FAF6F0]">match</span>
        </div>
        <p className="text-red-200 text-base mb-2 font-medium">충북대학교 전용 매칭 플랫폼</p>
        <p className="text-white/70 mb-10 text-sm leading-relaxed">
          스포츠 매치 상대를 찾고,<br />
          공모전 팀원을 모집하세요
        </p>

        <div className="grid grid-cols-2 gap-3 mb-12 w-full max-w-xs">
          {[
            { icon: Swords, label: '스포츠 매칭', desc: '종목·수준별 상대 찾기' },
            { icon: Trophy, label: '공모전 팀빌딩', desc: '전국 공모전 모집' },
            { icon: MessageSquare, label: '실시간 채팅', desc: '매치 확정 즉시 대화' },
            { icon: Star, label: '매너 평가', desc: '신뢰 기반 커뮤니티' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left border border-white/20">
              <Icon className="w-6 h-6 mb-2 text-[#FAF6F0]" />
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-white/60 mt-1">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/login"
            className="bg-[#FAF6F0] text-[#C41230] py-3.5 rounded-xl font-bold text-center hover:bg-white transition-colors shadow-lg"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="bg-white/15 text-white py-3.5 rounded-xl font-semibold text-center hover:bg-white/25 transition-colors border border-white/30"
          >
            회원가입
          </Link>
        </div>

        <p className="mt-8 text-white/40 text-xs">충북대학교 재학생 전용 서비스</p>
      </div>
    </div>
  )
}
