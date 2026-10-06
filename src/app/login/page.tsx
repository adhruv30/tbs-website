import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { GoogleSignIn } from '@/components/portal/google-sign-in'
import { portalCopy } from '@/data/site'
import { getCurrentMember } from '@/lib/dal'

export const metadata: Metadata = {
  title: portalCopy.login.heading,
  robots: { index: false },
}

const ERRORS: Record<string, string> = {
  'not-a-member': portalCopy.login.notAMember,
  'sign-in-failed': portalCopy.login.failed,
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
        <GoogleSignIn />
      </div>
    </section>
  )
}
