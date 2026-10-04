/**
 * With no Supabase configured, `next dev` runs against a mock backend: a JSON
 * file under `.dev-data/` seeded with dummy data, and cookie-based dev
 * sign-in. Never in a production build -- there a missing Supabase env is an
 * error, not a reason to open up fake logins.
 */
export function isMockBackend() {
  return process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SUPABASE_URL
}

/** Holds the dev account's email while signed in to the mock backend. */
export const MOCK_SESSION_COOKIE = 'tbs-mock-session'
