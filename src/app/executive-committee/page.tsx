import type { Metadata } from 'next'

import { RosterPage } from '@/components/roster-page'
import { membersByCohort } from '@/data/members'
import { execPage, pageOpenGraph } from '@/data/site'

const description = 'The executive committee of Triton Business Society.'

export const metadata: Metadata = {
  title: execPage.heading,
  description,
  openGraph: pageOpenGraph(execPage.heading, description),
}

export default function ExecutiveCommitteePage() {
  return (
    <RosterPage
      heading={execPage.heading}
      members={membersByCohort('exec')}
      from="exec"
    />
  )
}
