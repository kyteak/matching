import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('contest_resumes')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json(data ?? null)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { full_name, department, interests, certifications, mindset, preferred_role, skill_level } = body

  if (!full_name || !department || !interests || !mindset || !preferred_role || !skill_level) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('contest_resumes')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('contest_resumes')
      .update({ full_name, department, interests, certifications, mindset, preferred_role, skill_level, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('contest_resumes')
    .insert({ user_id: user.id, full_name, department, interests, certifications, mindset, preferred_role, skill_level })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
