import { NextResponse, type NextRequest } from 'next/server'

import { getCurrentMember } from '@/lib/dal'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/** Google sends the member back here with a one-time code to trade for a session. */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const fail = (error: string) =>
    NextResponse.redirect(new URL(`/login?error=${error}`, origin))

  if (!code) return fail('sign-in-failed')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) return fail('sign-in-failed')

  // Any Google account can complete OAuth; only the roster gets in.
  const member = await getCurrentMember()
  if (!member) {
    await supabase.auth.signOut()
    return fail('not-a-member')
  }

  await createAdminClient()
    .from('members')
    .update({ auth_user_id: data.user.id })
    .eq('id', member.id)
    .is('auth_user_id', null)

  return NextResponse.redirect(new URL('/portal', origin))
}
