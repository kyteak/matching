import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function checkMembership(supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>, roomId: string, userId: string) {
  const { data } = await supabase
    .from('contest_chat_members')
    .select('id')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await checkMembership(supabase, roomId, user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('contest_chat_messages')
    .select('*, profiles(id, nickname)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await checkMembership(supabase, roomId, user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { content } = await request.json()
  const { data, error } = await supabase.from('contest_chat_messages').insert({
    room_id: roomId,
    sender_id: user.id,
    content,
  }).select('*, profiles(id, nickname)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
