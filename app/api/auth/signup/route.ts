import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, password, fullName, nickname, studentId, department } = body

  const supabase = createAdminClient()
  const email = `${username}@cbnu.match`

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    username,
    nickname,
    full_name: fullName,
    student_id: studentId,
    skill_level: '초급',
    department,
    contest_count: 0,
  })

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
