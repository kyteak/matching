import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: contestMatchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: contest } = await supabase
    .from('contest_matches')
    .select('author_id, contest_name, status, current_count, team_size')
    .eq('id', contestMatchId)
    .single()

  if (!contest) return NextResponse.json({ error: '공모전을 찾을 수 없습니다.' }, { status: 404 })
  if (contest.author_id === user.id) return NextResponse.json({ error: '본인 게시글에는 신청할 수 없습니다.' }, { status: 400 })
  if (contest.status !== '모집중') return NextResponse.json({ error: '모집이 마감된 공모전입니다.' }, { status: 400 })
  if (contest.current_count >= contest.team_size) return NextResponse.json({ error: '정원이 가득 찼습니다.' }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', user.id).single()

  const { data, error } = await supabase.from('contest_applications').insert({
    contest_match_id: contestMatchId,
    applicant_id: user.id,
    status: 'pending',
  }).select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: '이미 신청했습니다.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.from('notifications').insert({
    user_id: contest.author_id,
    type: 'contest_apply',
    message: `${profile?.nickname} 님이 공모전 팀원 신청했습니다.`,
    related_id: contestMatchId,
  })

  return NextResponse.json(data, { status: 201 })
}
