import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles!reviews_reviewer_id_fkey(id, nickname)')
    .eq('reviewee_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { matchId, revieweeId, rating } = await request.json()

  const { data: app } = await supabase
    .from('match_applications')
    .select('id')
    .eq('match_id', matchId)
    .eq('status', 'accepted')
    .or(`applicant_id.eq.${user.id},applicant_id.eq.${revieweeId}`)
    .maybeSingle()

  if (!app) return NextResponse.json({ error: '평가 권한이 없습니다.' }, { status: 403 })

  const { data, error } = await supabase.from('reviews').insert({
    match_id: matchId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating,
  }).select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: '이미 평가했습니다.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 201 })
}
