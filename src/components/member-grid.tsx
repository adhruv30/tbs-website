import { MemberCard } from '@/components/member-card'
import { Reveal } from '@/components/reveal'
import type { Member } from '@/data/members'

export function MemberGrid({
  members,
  showRoles = true,
}: {
  members: Member[]
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
          <MemberCard member={member} index={index} showRole={showRoles} />
        </Reveal>
      ))}
    </ul>
  )
}
