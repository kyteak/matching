import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: room } = await supabase
    .from('message_rooms')
    .select('participant_1, participant_2')
    .eq('id', roomId)
    .single()

  if (!room || (room.participant_1 !== user.id && room.participant_2 !== user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles(id, nickname)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await request.json()
  const { data, error } = await supabase.from('messages').insert({
    room_id: roomId,
    sender_id: user.id,
    content,
  }).select('*, profiles(id, nickname)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data: room } = await supabase
    .from('message_rooms')
    .select('participant_1, participant_2')
    .eq('id', roomId)
    .single()

  if (room) {
    const recipientId = room.participant_1 === user.id ? room.participant_2 : room.participant_1
    const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', user.id).single()
    await supabase.from('notifications').insert({
      user_id: recipientId,
      type: 'new_message',
      message: `${profile?.nickname}: ${content.slice(0, 30)}${content.length > 30 ? '...' : ''}`,
      related_id: roomId,
    })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: room } = await supabase
    .from('message_rooms')
    .select('participant_1, participant_2')
    .eq('id', roomId)
    .single()

  if (!room || (room.participant_1 !== user.id && room.participant_2 !== user.id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await supabase.from('messages').delete().eq('room_id', roomId)
  await supabase.from('message_rooms').delete().eq('id', roomId)
  return NextResponse.json({ success: true })
}
