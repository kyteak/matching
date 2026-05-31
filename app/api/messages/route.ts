import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('message_rooms')
    .select(`
      *,
      p1:profiles!message_rooms_participant_1_fkey(id, nickname),
      p2:profiles!message_rooms_participant_2_fkey(id, nickname)
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
