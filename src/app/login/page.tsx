import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { GoogleSignIn } from '@/components/portal/google-sign-in'
import { portalCopy } from '@/data/site'
import { isMockBackend } from '@/lib/backend-mode'
import { getCurrentMember } from '@/lib/dal'
import { DEV_ACCOUNTS, devLoginEnabled } from '@/lib/dev-accounts'

import { devSignIn } from './actions'

export const metadata: Metadata = {
  title: portalCopy.login.heading,
  robots: { index: false },
}

const ERRORS: Record<string, string> = {
  'not-a-member': portalCopy.login.notAMember,
  'sign-in-failed': portalCopy.login.failed,
  'dev-not-seeded':
    'Dev sign-in failed. Is local Supabase running, and have you run `pnpm seed:dummy`?',
}

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  if (await getCurrentMember()) redirect('/portal')

  const { error } = await searchParams
  const message = typeof error === 'string' ? ERRORS[error] : undefined

  return (
    <section className="mx-auto flex w-full max-w-md flex-col px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight">
        {portalCopy.login.heading}
      </h1>
      <p className="mt-3 leading-relaxed text-navy-900/75">
        {portalCopy.login.body}
      </p>
      {message && (
        <p
          role="alert"
          className="mt-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {message}
        </p>
      )}
      <div className="mt-8">
        {isMockBackend() ? (
          <p className="rounded-md bg-sand px-4 py-3 text-sm text-navy-900/75">
            Google sign-in needs Supabase. Without it, <code>next dev</code> runs
            on mock data: sign in with a dev account below.
          </p>
        ) : (
          <GoogleSignIn />
        )}
      </div>

      {devLoginEnabled() && (
        <form
          action={devSignIn}
          className="mt-10 rounded-lg border border-dashed border-gold-500 bg-white p-5"
        >
          <h2 className="font-bold">Dev sign in</h2>
          <p className="mt-1 text-sm text-navy-900/65">
            Only shown under <code>next dev</code>.{' '}
            {isMockBackend() ? (
              <>
                Mock data lives in <code>.dev-data/</code>; delete it to reset.
              </>
            ) : (
              <>
                Accounts come from <code>pnpm seed:dummy</code>.
              </>
            )}
          </p>
          <div className="mt-4 space-y-2">
            {DEV_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="submit"
                name="email"
                value={account.email}
                className="block w-full rounded-md border border-sand-dark px-4 py-2.5 text-left transition-colors hover:border-gold-500 hover:bg-parchment"
              >
                <span className="font-semibold">{account.label}</span>
                <span className="block text-sm text-navy-900/65">
                  {account.email} · {account.description}
                </span>
              </button>
            ))}
          </div>
        </form>
      )}
    </section>
  )
}
