import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMatchSizeLimit } from '@/lib/utils'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: match } = await supabase
    .from('matches')
    .select('author_id, team_name, status, match_size')
    .eq('id', matchId)
    .single()

  if (!match) return NextResponse.json({ error: '매치를 찾을 수 없습니다.' }, { status: 404 })
  if (match.author_id === user.id) return NextResponse.json({ error: '본인 게시글에는 신청할 수 없습니다.' }, { status: 400 })
  if (match.status !== '모집중') return NextResponse.json({ error: '신청할 수 없는 매치입니다.' }, { status: 400 })

  const limit = getMatchSizeLimit(match.match_size)
  const { count } = await supabase
    .from('match_applications')
    .select('id', { count: 'exact', head: true })
    .eq('match_id', matchId)
    .neq('status', 'rejected')
  if ((count ?? 0) >= limit) return NextResponse.json({ error: `인원이 마감되었습니다. (최대 ${limit}명)` }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, skill_level')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase.from('match_applications').insert({
    match_id: matchId,
    applicant_id: user.id,
    status: 'pending',
  }).select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: '이미 신청한 매치입니다.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.from('notifications').insert({
    user_id: match.author_id,
    type: 'match_apply',
    message: `${profile?.nickname} 님이 매치를 신청했습니다. 실력: ${profile?.skill_level}`,
    related_id: data.id,
  })

  return NextResponse.json(data, { status: 201 })
}
