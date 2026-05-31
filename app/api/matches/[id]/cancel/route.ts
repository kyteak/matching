import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .single()

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .update({ status: '취소됨', updated_at: new Date().toISOString() })
    .eq('id', matchId)
    .eq('author_id', user.id)
    .select().single()

  if (matchError) return NextResponse.json({ error: matchError.message }, { status: 400 })

  const { data: accepted } = await supabase
    .from('match_applications')
    .select('applicant_id')
    .eq('match_id', matchId)
    .eq('status', 'accepted')

  if (accepted && accepted.length > 0) {
    for (const app of accepted) {
      await supabase.from('notifications').insert({
        user_id: app.applicant_id,
        type: 'match_cancel',
        message: `${profile?.nickname} 님이 매치를 취소했습니다.`,
        related_id: matchId,
      })
    }
  }

  return NextResponse.json(match)
}
