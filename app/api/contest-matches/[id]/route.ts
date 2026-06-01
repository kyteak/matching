import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: match, error } = await supabase
    .from('contest_matches')
    .select('*, profiles(id, nickname, department)')
    .eq('id', id)
    .single()

  if (error || !match) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: authorResume } = await supabase
    .from('contest_resumes')
    .select('*')
    .eq('user_id', match.author_id)
    .maybeSingle()

  const isAuthor = user?.id === match.author_id
  let isAccepted = false
  let teamResumes: any[] = []

  if (user) {
    if (!isAuthor) {
      const { data: app } = await supabase
        .from('contest_applications')
        .select('status')
        .eq('contest_match_id', id)
        .eq('applicant_id', user.id)
        .maybeSingle()
      isAccepted = app?.status === 'accepted'
    }

    if (isAuthor || isAccepted) {
      const { data: acceptedApps } = await supabase
        .from('contest_applications')
        .select('applicant_id, profiles(nickname, department)')
        .eq('contest_match_id', id)
        .eq('status', 'accepted')

      if (acceptedApps && acceptedApps.length > 0) {
        const memberIds = acceptedApps.map((a) => a.applicant_id)
        const { data: resumes } = await supabase
          .from('contest_resumes')
          .select('*')
          .in('user_id', memberIds)

        teamResumes = (resumes ?? []).map((r) => ({
          ...r,
          profile: (acceptedApps.find((a) => a.applicant_id === r.user_id) as any)?.profiles,
        }))
      }
    }
  }

  return NextResponse.json({ match, authorResume, teamResumes, isAuthor, isAccepted })
}
