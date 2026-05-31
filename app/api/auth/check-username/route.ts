import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username')
  if (!username) return NextResponse.json({ available: false })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
