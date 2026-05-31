import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const { data, error } = await supabase
    .from('external_contests')
    .select('*')
    .gt('deadline', yesterday.toISOString().split('T')[0])
    .order('deadline', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
