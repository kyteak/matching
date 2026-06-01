'use client'

import { useEffect, useState } from 'react'
import { SportsReservation } from '@/types/database'
import { CalendarDays, ChevronRight } from 'lucide-react'

const FACILITIES = ['전체', '풋살A', '풋살B', '농구A', '농구B']

const FACILITY_LABELS: Record<string, string> = {
  futsal_a: '풋살A',
  futsal_b: '풋살B',
  basketball_a: '농구A',
  basketball_b: '농구B',
}

const STATUS_STYLE = {
  available: 'bg-green-100 text-green-700',
  reserved: 'bg-red-100 text-red-600 line-through',
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

const TODAY = formatDate(new Date())

export default function SportsPage() {
  const [selectedFacility, setSelectedFacility] = useState('전체')
  const [offset, setOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [reservations, setReservations] = useState<SportsReservation[]>([])
  const [loading, setLoading] = useState(true)

  // 오늘부터 7일씩 앞으로만
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(TODAY), offset + i))

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ date: selectedDate })
    fetch(`/api/sports-reservations?${params}`)
      .then((r) => r.json())
      .then((d) => setReservations(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [selectedDate])

  const filtered = reservations.filter((r) => {
    if (selectedFacility === '전체') return true
    const label = FACILITY_LABELS[r.facility] ?? r.facility
    return label === selectedFacility
  })

  const grouped = filtered.reduce<Record<string, SportsReservation[]>>((acc, r) => {
    const key = FACILITY_LABELS[r.facility] ?? r.facility
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b sticky top-14 z-10">
        <div className="flex items-center px-2 py-2 gap-1">
          {/* 뒤로가기 — offset > 0 일 때만 표시 */}
          <div className="w-7">
            {offset > 0 && (
              <button
                onClick={() => {
                  const newOffset = offset - 7
                  setOffset(newOffset)
                  setSelectedDate(formatDate(addDays(new Date(TODAY), newOffset)))
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <CalendarDays className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-x-auto flex gap-1 scrollbar-hide">
            {weekDates.map((d) => {
              const str = formatDate(d)
              const isSelected = str === selectedDate
              const isToday = str === TODAY
              const dayIdx = d.getDay()
              return (
                <button
                  key={str}
                  onClick={() => setSelectedDate(str)}
                  className={`flex-shrink-0 w-11 flex flex-col items-center py-1.5 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#1E3A5F] text-white'
                      : isToday
                      ? 'bg-blue-50 text-[#1E3A5F]'
                      : 'text-gray-500'
                  }`}
                >
                  <span className={`font-medium ${dayIdx === 0 ? 'text-red-400' : dayIdx === 6 ? 'text-blue-400' : ''} ${isSelected ? '!text-white' : ''}`}>
                    {isToday ? '오늘' : dayNames[dayIdx]}
                  </span>
                  <span className="font-bold text-sm">{d.getDate()}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => {
              const newOffset = offset + 7
              setOffset(newOffset)
              setSelectedDate(formatDate(addDays(new Date(TODAY), newOffset)))
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto flex gap-2 px-4 pb-3 scrollbar-hide">
          {FACILITIES.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFacility(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedFacility === f
                  ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <EmptyState />
        ) : (
          Object.entries(grouped).map(([facility, slots]) => (
            <div key={facility} className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-[#1E3A5F] text-sm mb-3">{facility}</h3>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`rounded-xl px-2 py-2 text-center text-xs font-medium ${STATUS_STYLE[slot.status]}`}
                  >
                    <div>{slot.start_time}~{slot.end_time}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">
                      {slot.status === 'available' ? '예약가능' : '예약완료'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-400">
      <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-medium">예약 현황이 없습니다.</p>
      <p className="text-xs mt-1">해당 날짜에 예약 정보가 없습니다.</p>
    </div>
  )
}
