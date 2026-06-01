export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">충북match</h1>
          <p className="text-sm text-gray-500 mt-1">충북대학교 전용 매칭 플랫폼</p>
        </div>
        {children}
      </div>
    </div>
  )
}
