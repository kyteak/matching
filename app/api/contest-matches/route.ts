import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const region = request.nextUrl.searchParams.get('region')

  let query = supabase
    .from('contest_matches')
    .select('*, profiles(id, nickname)')
    .eq('status', '모집중')
    .gt('deadline', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false })

  if (region && region !== '전체') query = query.eq('region', region)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { contestName, contestCategory, region, deadline, teamSize, description } = body

  const { data, error } = await supabase.from('contest_matches').insert({
    author_id: user.id,
    contest_name: contestName,
    contest_category: contestCategory,
    region,
    deadline,
    team_size: teamSize,
    current_count: 0,
    description,
    status: '모집중',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data: room } = await supabase.from('contest_chat_rooms').insert({
    contest_match_id: data.id,
    name: contestName,
  }).select().single()

  if (room) {
    await supabase.from('contest_chat_members').insert({
      room_id: room.id,
      user_id: user.id,
    })
  }

  return NextResponse.json(data, { status: 201 })
}
