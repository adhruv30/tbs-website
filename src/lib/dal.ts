import 'server-only'

import { redirect } from 'next/navigation'
import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'

export type CurrentMember = {
  id: string
  name: string
  isAdmin: boolean
}

/**
 * The signed-in member, or `null` for no session or an account that isn't on
 * the roster. Their role comes from the roster's `is_admin` on every request,
 * so a change in Supabase applies on the next page load.
 *
 * Identity is resolved by the database's `current_member_id()` -- the same
 * function every RLS policy uses -- so the app and the policies can't
 * disagree about who someone is. It matches the account's confirmed email
 * against `members.email`.
 */
export const getCurrentMember = cache(async (): Promise<CurrentMember | null> => {
  const supabase = await createClient()
  // Verifies the session with Supabase Auth rather than trusting the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: memberId } = await supabase.rpc('current_member_id')
  if (typeof memberId !== 'string') return null

  const { data } = await supabase
    .from('members')
    .select('id, name, is_admin')
    .eq('id', memberId)
    .maybeSingle()
  if (!data) return null

  return { id: data.id, name: data.name, isAdmin: data.is_admin === true }
})

export async function requireMember(): Promise<CurrentMember> {
  const member = await getCurrentMember()
  if (!member) redirect('/login')
  return member
}
