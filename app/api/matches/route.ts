import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const sport = request.nextUrl.searchParams.get('sport')
  const level = request.nextUrl.searchParams.get('level')

  let query = supabase
    .from('matches')
    .select('*, profiles(id, nickname, skill_level)')
    .eq('status', '모집중')
    .gt('match_datetime', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (sport && sport !== '전체') query = query.eq('sport', sport)
  if (level && level !== '전체') query = query.eq('required_level', level)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { teamName, sport, matchSize, location, description, requiredLevel, matchDatetime } = body

  const { data, error } = await supabase.from('matches').insert({
    author_id: user.id,
    team_name: teamName,
    sport,
    match_size: matchSize,
    location,
    description,
    required_level: requiredLevel,
    match_datetime: matchDatetime,
    status: '모집중',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
