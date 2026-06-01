import { Header } from '@/components/layout/Header'

export const dynamic = 'force-dynamic'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <Header />
      <main className="max-w-lg mx-auto pt-14 min-h-screen">
        {children}
      </main>
    </div>
  )
}
