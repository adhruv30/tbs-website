import type { Metadata } from 'next'

import { RosterPage } from '@/components/roster-page'
import { membersByCohort } from '@/data/members'
import { membersPage } from '@/data/site'

export const metadata: Metadata = {
  title: membersPage.heading,
  description: 'The active membership of Triton Business Society.',
}

export default function ActiveMembersPage() {
  return (
    <RosterPage
      heading={membersPage.heading}
      members={membersByCohort('active')}
    />
  )
}
