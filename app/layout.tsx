import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '충북match — 충북대 스포츠·공모전 매칭',
  description: '충북대학교 학생 전용 스포츠 매치 및 공모전 팀원 매칭 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
