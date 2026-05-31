import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: appId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: app } = await supabase
    .from('contest_applications')
    .select('*, contest_matches(author_id, contest_name)')
    .eq('id', appId)
    .single()

  if (!app || app.contest_matches?.author_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await supabase
    .from('contest_applications')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', appId)

  await supabase.from('notifications').insert({
    user_id: app.applicant_id,
    type: 'contest_reject',
    message: `${app.contest_matches?.contest_name} 팀원 신청이 거절되었습니다.`,
    related_id: app.contest_match_id,
  })

  return NextResponse.json({ success: true })
}
