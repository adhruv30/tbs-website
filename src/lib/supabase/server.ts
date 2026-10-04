import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { supabaseEnv } from './env'

/**
 * A client acting as the signed-in member, so every query runs under RLS.
 * Server Components can't write cookies; the proxy refreshes the session
 * before they render, so the swallowed `setAll` there is harmless.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = supabaseEnv()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component; the proxy handles the refresh.
        }
      },
    },
  })
}
