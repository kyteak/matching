import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: appId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: app } = await supabase
    .from('contest_applications')
    .select('*, contest_matches(author_id, contest_name, team_size, current_count)')
    .eq('id', appId)
    .single()

  if (!app || app.contest_matches?.author_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await supabase
    .from('contest_applications')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', appId)

  const newCount = (app.contest_matches?.current_count ?? 0) + 1
  const isFull = newCount >= (app.contest_matches?.team_size ?? 0)

  await supabase
    .from('contest_matches')
    .update({
      current_count: newCount,
      status: isFull ? '마감' : '모집중',
      updated_at: new Date().toISOString(),
    })
    .eq('id', app.contest_match_id)

  const { data: room } = await supabase
    .from('contest_chat_rooms')
    .select('id')
    .eq('contest_match_id', app.contest_match_id)
    .single()

  if (room) {
    await supabase.from('contest_chat_members').upsert({
      room_id: room.id,
      user_id: app.applicant_id,
    }, { onConflict: 'room_id,user_id' })
  }

  await supabase.from('notifications').insert({
    user_id: app.applicant_id,
    type: 'contest_accept',
    message: `${app.contest_matches?.contest_name} 팀원 신청이 수락되었습니다!`,
    related_id: app.contest_match_id,
  })

  if (isFull) {
    const { data: pending } = await supabase
      .from('contest_applications')
      .select('id, applicant_id')
      .eq('contest_match_id', app.contest_match_id)
      .eq('status', 'pending')

    if (pending && pending.length > 0) {
      await supabase
        .from('contest_applications')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .in('id', pending.map((p) => p.id))

      for (const p of pending) {
        await supabase.from('notifications').insert({
          user_id: p.applicant_id,
          type: 'contest_reject',
          message: `${app.contest_matches?.contest_name} 팀원 신청이 거절되었습니다.`,
          related_id: app.contest_match_id,
        })
      }
    }
  }

  return NextResponse.json({ success: true, isFull })
}
