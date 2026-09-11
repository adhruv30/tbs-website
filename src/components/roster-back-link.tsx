'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

/**
 * The two rosters a profile can be reached from. Cards link with `?from=<key>`
 * (see `MemberCard`), and the key is looked up here rather than used to build a
 * URL, so a hand-edited value can only ever fall back — never point the link
 * somewhere unexpected.
 */
export const ROSTERS = {
  members: { href: '/members', label: 'Active members' },
  exec: { href: '/executive-committee', label: 'Executive committee' },
} as const

export type RosterKey = keyof typeof ROSTERS

function isRosterKey(value: string | null): value is RosterKey {
  return value !== null && value in ROSTERS
}

export function BackLink({ roster }: { roster: RosterKey }) {
  const { href, label } = ROSTERS[roster]

  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm text-parchment/60 transition-colors hover:text-gold-400"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-x-1"
      >
        <path
          d="M15 5 8 12l7 7"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </Link>
  )
}

/**
 * Points back at the roster the visitor actually came from. Exec appear on both
 * rosters, so their own cohort is the wrong answer whenever someone arrived
 * from the full membership list.
 *
 * `fallback` covers every case with no `?from`: a shared link, a bookmark, a
 * search result. It is also what the prerendered HTML carries, since this hook
 * only resolves on the client — hence the `<Suspense>` the caller wraps this
 * in, which is what keeps the profile pages static.
 */
export function RosterBackLink({ fallback }: { fallback: RosterKey }) {
  const from = useSearchParams().get('from')
  return <BackLink roster={isRosterKey(from) ? from : fallback} />
}
