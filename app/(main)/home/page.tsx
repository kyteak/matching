import Link from 'next/link'
import { Swords, Trophy, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="px-4 py-10">
      <p className="text-gray-400 text-sm mb-8 text-center">어떤 활동을 하시겠어요?</p>

      <div className="space-y-4">
        <Link
          href="/match"
          className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-14 h-14 bg-[#1E3A5F] rounded-2xl flex items-center justify-center shrink-0">
            <Swords className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#1E3A5F]">스포츠 매칭</h2>
            <p className="text-sm text-gray-400 mt-0.5">팀원을 모집하고 경기를 즐기세요</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
        </Link>

        <Link
          href="/contest"
          className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-14 h-14 bg-[#FF6B35] rounded-2xl flex items-center justify-center shrink-0">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#FF6B35]">공모전 팀 모집</h2>
            <p className="text-sm text-gray-400 mt-0.5">함께할 팀원을 찾아보세요</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
        </Link>
      </div>
    </div>
  )
}
