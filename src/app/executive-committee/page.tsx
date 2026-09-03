import type { Metadata } from 'next'

import { RosterPage } from '@/components/roster-page'
import { membersByCohort } from '@/data/members'
import { execPage } from '@/data/site'

export const metadata: Metadata = {
  title: execPage.heading,
  description: 'The executive committee of Triton Business Society.',
}

export default function ExecutiveCommitteePage() {
  return (
    <RosterPage heading={execPage.heading} members={membersByCohort('exec')} />
  )
}
