import Image from 'next/image'

import { MemberGrid } from '@/components/member-grid'
import { getRosterBackdrop } from '@/components/roster-backdrops'
import { wordStrokes } from '@/components/word-strokes'
import type { Member } from '@/data/members'
import type { RosterKey } from '@/data/rosters'

/**
 * When the heading starts being written, in seconds: the moment the band
 * finishes collapsing (see `.roster-band` in globals.css).
 */
const HEADING_START = 1.55

export async function RosterPage({
  heading,
  members,
  from,
  showRoles = true,
}: {
  heading: string
  members: Member[]
  /** Tags every card so a profile can send the visitor back here. */
  from: RosterKey
  showRoles?: boolean
}) {
  // Each roster gets its own photo, picked up by filename — see
  // `getRosterBackdrop`. The navy ground behind it is what keeps the heading
  // readable if one is missing.
  const backdrop = await getRosterBackdrop(from)

  return (
    <>
      {/*
        Backdrop is scoped to this header band only — the roster below it stays
        on the page background. `isolate` keeps the -z-10 layers inside the band.

        The band opens at full height with the photo undimmed and settles from
        there; the animation and the band's own height both live on
        `.roster-band` in globals.css.
      */}
      <div className="roster-band relative isolate flex items-center overflow-hidden bg-navy-950 text-parchment">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            sizes="100vw"
            preload
            quality={70}
            className="-z-10 object-cover"
          />
        ) : null}
        {/* Scrim: keeps the heading readable over any part of the photo. */}
        <div className="roster-scrim absolute inset-0 -z-10 bg-navy-950/55" aria-hidden />

        <div className="mx-auto w-full max-w-[1700px] px-5 sm:px-8">
          <h1 className="text-center font-serif text-5xl leading-tight font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {wordStrokes(heading, HEADING_START).map(
              ({ word, duration, delay }, index) => (
                <span
                  key={`${word}-${index}`}
                  className="roster-word"
                  style={{
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  {word}
                </span>
              ),
            )}
          </h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1700px] px-5 py-12 sm:px-8 sm:py-16">
        <MemberGrid members={members} from={from} showRoles={showRoles} />
      </div>
    </>
  )
}
