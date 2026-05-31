import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: match } = await admin
    .from('matches')
    .select('id, author_id')
    .eq('id', id)
    .single()

  if (!match) return NextResponse.json({ error: '매치를 찾을 수 없습니다.' }, { status: 404 })

  // 기존 author가 profiles에 존재하는지 확인
  const { data: authorProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('id', match.author_id)
    .maybeSingle()

  if (authorProfile) {
    return NextResponse.json(
      { error: '이미 유효한 소유자가 있는 매치는 가져올 수 없습니다.' },
      { status: 403 }
    )
  }

  // 원래 author가 존재하지 않으므로 현재 유저로 소유권 이전
  const { error } = await admin
    .from('matches')
    .update({ author_id: user.id })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
