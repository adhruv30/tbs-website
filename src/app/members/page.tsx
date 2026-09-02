import type { Metadata } from 'next'

import { MembersBrowser } from '@/components/members-browser'
import { membersByCohort } from '@/data/members'
import { membersPage } from '@/data/site'

export const metadata: Metadata = {
  title: 'Members',
  description: membersPage.intro,
}

export default function MembersIndexPage() {
  const groups = {
    exec: membersByCohort('exec'),
    active: membersByCohort('active'),
  }

  return (
    <>
      <div className="bg-navy-950 pt-24 pb-16 text-parchment sm:pt-28 sm:pb-20">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-gold-400 uppercase">
            {membersPage.eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight font-bold tracking-tight text-balance sm:text-6xl">
            {membersPage.heading}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-parchment/75 text-pretty sm:text-lg">
            {membersPage.intro}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <MembersBrowser tabs={membersPage.tabs} groups={groups} />
      </div>
    </>
  )
}
