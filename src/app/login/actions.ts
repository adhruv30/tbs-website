'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { isMockBackend, MOCK_SESSION_COOKIE } from '@/lib/backend-mode'
import { getCurrentMember } from '@/lib/dal'
import { DEV_ACCOUNTS, DEV_PASSWORD, devLoginEnabled } from '@/lib/dev-accounts'
import { createClient } from '@/lib/supabase/server'

/** Sign in as one of the dev accounts. `next dev` only. */
export async function devSignIn(formData: FormData) {
  if (!devLoginEnabled()) redirect('/login')

  const email = formData.get('email')
  if (typeof email !== 'string' || !DEV_ACCOUNTS.some((a) => a.email === email)) {
    redirect('/login')
  }

  const cookieStore = await cookies()
  const supabase = isMockBackend() ? null : await createClient()

  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: DEV_PASSWORD })
    if (error) redirect('/login?error=dev-not-seeded')
  } else {
    cookieStore.set(MOCK_SESSION_COOKIE, email, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }

  // Same gate as the Google callback.
  if (!(await getCurrentMember())) {
    if (supabase) await supabase.auth.signOut()
    else cookieStore.delete(MOCK_SESSION_COOKIE)
    redirect('/login?error=not-a-member')
  }
  redirect('/portal')
}
