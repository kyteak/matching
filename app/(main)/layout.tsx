import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="max-w-lg mx-auto pt-14 pb-16 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
