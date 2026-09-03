import { MemberCard } from '@/components/member-card'
import type { Member } from '@/data/members'

export function MemberGrid({ members }: { members: Member[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5 lg:gap-7">
      {members.map((member, index) => (
        <MemberCard key={member.slug} member={member} index={index} />
      ))}
    </ul>
  )
}
