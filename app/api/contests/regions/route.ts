import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const REGION_ORDER = [
  '서울특별시', '경기도', '인천광역시', '부산광역시', '대구광역시',
  '광주광역시', '대전광역시', '울산광역시', '세종특별자치시',
  '충청북도', '충청남도', '전라북도', '전라남도',
  '경상북도', '경상남도', '강원도', '제주특별자치도', '전국',
]

export async function GET() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('contests')
    .select('region')
    .gte('end_date', today)
    .eq('is_active', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const regions = [...new Set((data ?? []).map((r) => r.region).filter(Boolean))]
  regions.sort((a, b) => {
    const ai = REGION_ORDER.indexOf(a)
    const bi = REGION_ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return NextResponse.json(regions)
}
