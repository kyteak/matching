import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const nickname = request.nextUrl.searchParams.get('nickname')
  if (!nickname) return NextResponse.json({ available: false })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('nickname', nickname)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
