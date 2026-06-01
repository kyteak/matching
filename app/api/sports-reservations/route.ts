import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const facility = request.nextUrl.searchParams.get('facility')
  const date = request.nextUrl.searchParams.get('date')

  const today = new Date().toISOString().split('T')[0]
  const targetDate = date ?? today

  let query = supabase
    .from('sports_reservations')
    .select('*')
    .eq('reservation_date', targetDate)
    .order('facility')
    .order('start_time')

  if (facility && facility !== '전체') query = query.eq('facility', facility)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
