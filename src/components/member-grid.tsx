import { MemberCard } from '@/components/member-card'
import { Reveal } from '@/components/reveal'
import type { Member } from '@/data/members'
import type { RosterKey } from '@/data/rosters'

export function MemberGrid({
  members,
  from,
  showRoles = true,
}: {
  members: Member[]
  from: RosterKey
  showRoles?: boolean
}) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5 lg:gap-7">
      {members.map((member, index) => (
        <Reveal
          key={member.slug}
          as="li"
          // Stagger across a row, then reset — a flat `index * n` would leave
          // the last of 40-odd cards waiting seconds before it appeared.
          delay={(index % 5) * 70}
        >
          <MemberCard
            member={member}
            index={index}
            from={from}
            showRole={showRoles}
          />
        </Reveal>
      ))}
    </ul>
  )
}
