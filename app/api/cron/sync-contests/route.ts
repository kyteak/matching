import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const { data: deleted, error } = await supabase
    .from('external_contests')
    .delete()
    .lt('deadline', yesterday.toISOString().split('T')[0])
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    deletedExpired: deleted?.length ?? 0,
    message: '외부 공모전 스크래핑은 별도 파이프라인에서 처리됩니다.',
  })
}
