import Image from 'next/image'

import { MemberGrid } from '@/components/member-grid'
import { Reveal } from '@/components/reveal'
import { getRosterBackdrop } from '@/components/roster-backdrops'
import type { Member } from '@/data/members'
import type { RosterKey } from '@/data/rosters'

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
      */}
      <div className="relative isolate overflow-hidden bg-navy-950 pt-32 pb-24 text-parchment sm:pt-44 sm:pb-32">
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
        <div className="absolute inset-0 -z-10 bg-navy-950/55" aria-hidden />

        <div className="mx-auto w-full max-w-[1700px] px-5 sm:px-8">
          <Reveal>
            <h1 className="text-center font-serif text-5xl leading-tight font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {heading}
            </h1>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1700px] px-5 py-12 sm:px-8 sm:py-16">
        <MemberGrid members={members} from={from} showRoles={showRoles} />
      </div>
    </>
  )
}
