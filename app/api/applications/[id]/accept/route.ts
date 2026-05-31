import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: appId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: app } = await supabase
    .from('match_applications')
    .select('*, matches(author_id, team_name, status)')
    .eq('id', appId)
    .single()

  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  if (app.matches?.author_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await supabase
    .from('match_applications')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', appId)

  await supabase
    .from('matches')
    .update({ status: '매치확정', updated_at: new Date().toISOString() })
    .eq('id', app.match_id)

  await supabase.from('message_rooms').insert({
    application_id: appId,
    participant_1: user.id,
    participant_2: app.applicant_id,
  })

  await supabase.from('notifications').insert({
    user_id: app.applicant_id,
    type: 'match_accept',
    message: `매치가 수락되었습니다! ${app.matches?.team_name}과의 매치가 확정됐어요.`,
    related_id: app.match_id,
  })

  return NextResponse.json({ success: true })
}
