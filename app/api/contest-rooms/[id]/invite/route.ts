import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: room } = await supabase
    .from('contest_chat_rooms')
    .select('contest_match_id, contest_matches(author_id)')
    .eq('id', roomId)
    .single()

  if (!room || (room.contest_matches as any)?.author_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: accepted } = await supabase
    .from('contest_applications')
    .select('applicant_id, profiles(id, nickname, skill_level)')
    .eq('contest_match_id', room.contest_match_id)
    .eq('status', 'accepted')

  const { data: members } = await supabase
    .from('contest_chat_members')
    .select('user_id')
    .eq('room_id', roomId)

  const memberIds = new Set(members?.map((m) => m.user_id))
  const invitable = (accepted ?? []).filter((a) => !memberIds.has(a.applicant_id))

  return NextResponse.json(invitable)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId: targetUserId } = await request.json()

  const { data: room } = await supabase
    .from('contest_chat_rooms')
    .select('contest_match_id, contest_matches(author_id)')
    .eq('id', roomId)
    .single()

  if (!room || (room.contest_matches as any)?.author_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: acceptedApp } = await supabase
    .from('contest_applications')
    .select('id')
    .eq('contest_match_id', room.contest_match_id)
    .eq('applicant_id', targetUserId)
    .eq('status', 'accepted')
    .maybeSingle()

  if (!acceptedApp) return NextResponse.json({ error: '수락된 신청자만 초대할 수 있습니다.' }, { status: 400 })

  const { error } = await supabase.from('contest_chat_members').insert({
    room_id: roomId,
    user_id: targetUserId,
  })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: '이미 멤버입니다.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
