import type { Metadata } from 'next'

import { RosterPage } from '@/components/roster-page'
import { membersByFirstName } from '@/data/members'
import { membersPage, pageOpenGraph } from '@/data/site'

const description = 'The membership of Triton Business Society.'

export const metadata: Metadata = {
  title: membersPage.heading,
  description,
  openGraph: pageOpenGraph(membersPage.heading, description),
}

export default function ActiveMembersPage() {
  return (
    // Exec appear here too, but their titles stay on the exec page and their
    // own profiles -- here they are simply members.
    <RosterPage
      heading={membersPage.heading}
      members={membersByFirstName()}
      from="members"
      showRoles={false}
    />
  )
}
