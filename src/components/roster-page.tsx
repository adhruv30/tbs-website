import Image from 'next/image'

// Static import so the asset gets a content-hashed URL: swapping the file in
// public/ changes the URL, so browsers can never serve a stale cached copy.
// Do not replace this with the string path '/membersBackdrop.jpg'.
import membersBackdrop from '../../public/membersBackdrop.jpg'
import { MemberGrid } from '@/components/member-grid'
import type { Member } from '@/data/members'

export function RosterPage({
  heading,
  members,
  showRoles = true,
}: {
  heading: string
  members: Member[]
  showRoles?: boolean
}) {
  return (
    <>
      {/*
        Backdrop is scoped to this header band only — the roster below it stays
        on the page background. `isolate` keeps the -z-10 layers inside the band.
      */}
      <div className="relative isolate overflow-hidden pt-24 pb-16 text-parchment sm:pt-28 sm:pb-20">
        <Image
          src={membersBackdrop}
          alt=""
          fill
          sizes="100vw"
          preload
          quality={70}
          className="-z-10 object-cover"
        />
        {/* Scrim: keeps the heading readable over any part of the photo. */}
        <div className="absolute inset-0 -z-10 bg-navy-950/55" aria-hidden />

        <div className="mx-auto w-full max-w-[1700px] px-5 sm:px-8">
          <h1 className="text-center font-serif text-5xl leading-tight font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {heading}
          </h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1700px] px-5 py-12 sm:px-8 sm:py-16">
        <MemberGrid members={members} showRoles={showRoles} />
      </div>
    </>
  )
}
