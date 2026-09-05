import type { Metadata } from 'next'

import { RosterPage } from '@/components/roster-page'
import { membersByFirstName } from '@/data/members'
import { membersPage } from '@/data/site'

export const metadata: Metadata = {
  title: membersPage.heading,
  description: 'The membership of Triton Business Society.',
}

export default function ActiveMembersPage() {
  return (
    // Exec appear here too, but their titles stay on the exec page and their
    // own profiles -- here they are simply members.
    <RosterPage
      heading={membersPage.heading}
      members={membersByFirstName()}
      showRoles={false}
    />
  )
}
