'use client'

import { useState } from 'react'

import { createClient } from '@/lib/supabase/browser'

export function GoogleSignIn() {
  const [pending, setPending] = useState(false)

  async function signIn() {
    setPending(true)
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
    // On success the browser is already navigating to Google.
    if (error) setPending(false)
  }

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-navy-900 px-5 py-3 font-semibold text-parchment transition-colors hover:bg-navy-800 disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" />
      </svg>
      {pending ? 'Redirecting…' : 'Sign in with Google'}
    </button>
  )
}
