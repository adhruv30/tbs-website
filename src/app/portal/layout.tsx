import type { Metadata } from 'next'

import { requireMember } from '@/lib/dal'

export const metadata: Metadata = {
  title: { default: 'Member portal', template: '%s · TBS portal' },
  robots: { index: false, follow: false },
}

export default async function PortalLayout({ children }: LayoutProps<'/portal'>) {
  const member = await requireMember()

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-end gap-4 border-b border-sand-dark pb-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-navy-900/70">
            {member.name}
            {member.isAdmin && (
              <span className="ml-2 rounded bg-gold-300 px-1.5 py-0.5 text-xs font-semibold">
                Admin
              </span>
            )}
          </span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="underline underline-offset-2 hover:text-gold-600">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="pt-8">{children}</div>
    </div>
  )
}
