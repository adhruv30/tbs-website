'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import type { MemberRef, Neighbors } from '@/data/members'
import { isRosterKey, type RosterKey } from '@/data/rosters'

/**
 * Neighbours for each roster this member appears on. Exec sit on both, so
 * which pair applies depends on where the visitor came from; everyone else has
 * only the membership list.
 */
export type NeighborsByRoster = Partial<Record<RosterKey, Neighbors>>

const ARROWS = {
  previous: 'M15 5 8 12l7 7',
  next: 'M9 5l7 7-7 7',
} as const

type Direction = keyof typeof ARROWS

function PagerStep({
  member,
  roster,
  direction,
}: {
  member: MemberRef
  /** Carried through so the next profile keeps walking the same roster. */
  roster: RosterKey
  direction: Direction
}) {
  const isNext = direction === 'next'

  return (
    <Link
      href={`/members/${member.slug}?from=${roster}`}
      // Nothing on screen says which way each name goes beyond the arrow and
      // the edge it sits at, so the direction is spelled out for screen
      // readers.
      aria-label={`${isNext ? 'Next' : 'Previous'} member: ${member.name}`}
      /*
        Grows from its own outer edge, so the step nearest the margin stays put
        rather than drifting off it.
      */
      className={`group inline-flex min-w-0 max-w-[45%] items-center gap-2 text-gold-600 transition duration-200 ease-out hover:scale-[1.06] focus-visible:outline-none ${
        isNext ? 'origin-right flex-row-reverse' : 'origin-left'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
      >
        <path
          d={ARROWS[direction]}
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Truncates rather than wraps, so two long names can't collide. */}
      <span className="truncate font-serif text-base font-semibold text-navy-900 underline-offset-[6px] transition-colors duration-200 group-hover:text-gold-600 group-hover:underline group-focus-visible:text-gold-600 group-focus-visible:underline sm:text-lg">
        {member.name}
      </span>
    </Link>
  )
}

/**
 * Walks the roster one profile at a time. Each end of the list simply drops
 * its link — the empty span is what keeps a lone "next" against the right
 * edge.
 */
export function MemberPager({
  neighbors,
  roster,
}: {
  neighbors: Neighbors
  roster: RosterKey
}) {
  if (!neighbors.previous && !neighbors.next) return null

  return (
    <nav
      aria-label="Roster"
      className="mt-14 flex items-center justify-between gap-4 sm:mt-16"
    >
      {neighbors.previous ? (
        <PagerStep
          member={neighbors.previous}
          roster={roster}
          direction="previous"
        />
      ) : (
        <span />
      )}
      {neighbors.next ? (
        <PagerStep member={neighbors.next} roster={roster} direction="next" />
      ) : null}
    </nav>
  )
}

/**
 * Pages through the roster the visitor actually came from, for the same reason
 * `RosterBackLink` points back at it: an exec reached from the full membership
 * list should step to their alphabetical neighbour, not their exec one.
 *
 * `fallback` is the roster used with no usable `?from` — a shared link, a
 * bookmark, a search result — and is what the prerendered HTML carries, since
 * this hook only resolves on the client. Hence the `<Suspense>` the caller
 * wraps this in, which is what keeps the profile pages static.
 */
export function RosterMemberPager({
  fallback,
  byRoster,
}: {
  fallback: RosterKey
  byRoster: NeighborsByRoster
}) {
  const from = useSearchParams().get('from')
  // A roster this member isn't on falls back too, so a hand-edited `?from`
  // can't strand the pager with an empty pair.
  const roster = isRosterKey(from) && byRoster[from] ? from : fallback
  const neighbors = byRoster[roster]
  if (!neighbors) return null

  return <MemberPager neighbors={neighbors} roster={roster} />
}
