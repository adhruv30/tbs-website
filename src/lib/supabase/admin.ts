import 'server-only'

import { createClient } from '@supabase/supabase-js'

import { supabaseEnv } from './env'

/**
 * Service-role client: bypasses RLS. Only for the public application form
 * (which has no session to act as) and first-login bookkeeping. Never hand
 * its results to a page without an explicit auth check.
 */
export function createAdminClient() {
  const { url } = supabaseEnv()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
