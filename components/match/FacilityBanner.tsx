'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SportsReservation } from '@/types/database'
import { ChevronRight } from 'lucide-react'

const FACILITY_LABELS: Record<string, string> = {
  futsal_a: '풋살A',
  futsal_b: '풋살B',
  basketball_a: '농구A',
  basketball_b: '농구B',
}

const FACILITY_EMOJI: Record<string, string> = {
  futsal_a: '⚽',
  futsal_b: '⚽',
  basketball_a: '🏀',
  basketball_b: '🏀',
}

export function FacilityBanner() {
  const [slots, setSlots] = useState<SportsReservation[]>([])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    fetch(`/api/sports-reservations?date=${today}`)
      .then((r) => r.json())
      .then((d) => setSlots(Array.isArray(d) ? d : []))
  }, [])

  if (slots.length === 0) return null

  const facilityKeys = Object.keys(FACILITY_LABELS)
  const summary = facilityKeys.map((key) => {
    const facilitySlots = slots.filter((s) => s.facility === key)
    const availableCount = facilitySlots.filter((s) => s.status === 'available').length
    const total = facilitySlots.length
    return { key, label: FACILITY_LABELS[key], emoji: FACILITY_EMOJI[key], availableCount, total }
  }).filter((f) => f.total > 0)

  if (summary.length === 0) return null

  return (
    <Link href="/sports" className="block mx-4 mt-3 mb-1">
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2d5a8e] rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-white text-xs font-bold">🏟️ 오늘의 체육시설 예약 현황</span>
          <span className="text-blue-200 text-xs flex items-center gap-0.5">
            자세히 <ChevronRight className="w-3 h-3" />
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {summary.map(({ key, label, emoji, availableCount, total }) => {
            const isFull = availableCount === 0
            return (
              <div
                key={key}
                className={`rounded-xl py-2 px-1 text-center ${isFull ? 'bg-white/10' : 'bg-white/20'}`}
              >
                <div className="text-lg leading-none mb-1">{emoji}</div>
                <div className="text-white text-[11px] font-semibold leading-tight">{label}</div>
                <div className={`text-[10px] mt-1 font-bold ${isFull ? 'text-red-300' : 'text-green-300'}`}>
                  {isFull ? '만석' : `${availableCount}슬롯`}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Link>
  )
}
