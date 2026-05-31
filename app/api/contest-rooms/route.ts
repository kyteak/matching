import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: memberOf } = await supabase
    .from('contest_chat_members')
    .select('room_id')
    .eq('user_id', user.id)

  if (!memberOf || memberOf.length === 0) return NextResponse.json([])

  const roomIds = memberOf.map((m) => m.room_id)
  const { data, error } = await supabase
    .from('contest_chat_rooms')
    .select('*, contest_matches(id, contest_name, region)')
    .in('id', roomIds)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
