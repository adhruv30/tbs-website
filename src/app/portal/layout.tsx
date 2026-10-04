import type { Metadata } from 'next'
import Link from 'next/link'

import { requireMember } from '@/lib/dal'
import { getLiveRoom } from '@/lib/room/data'

export const metadata: Metadata = {
  title: { default: 'Recruitment portal', template: '%s · TBS portal' },
  robots: { index: false, follow: false },
}

export default async function PortalLayout({ children }: LayoutProps<'/portal'>) {
  const member = await requireMember()
  const liveRoom = await getLiveRoom()

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-dark pb-4">
        <nav aria-label="Portal" className="flex items-center gap-5 font-semibold">
          <Link href="/portal" className="hover:text-gold-600">
            Applications
          </Link>
          <Link href="/portal/room" className="flex items-center gap-1.5 hover:text-gold-600">
            {liveRoom && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" aria-label="live" />
            )}
            Live room
          </Link>
          {member.isAdmin && (
            <Link href="/portal/admin" className="hover:text-gold-600">
              Admin
            </Link>
          )}
        </nav>
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
