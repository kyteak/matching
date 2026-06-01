import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const region = request.nextUrl.searchParams.get('region')
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('contests')
    .select('*')
    .gte('end_date', today)
    .eq('is_active', true)
    .order('end_date', { ascending: true })

  if (region && region !== '전체') query = query.eq('region', region)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
