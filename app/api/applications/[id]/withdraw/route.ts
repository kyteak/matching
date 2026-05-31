import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: appId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('match_applications')
    .delete()
    .eq('id', appId)
    .eq('applicant_id', user.id)
    .eq('status', 'pending')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
