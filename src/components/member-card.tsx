import Link from 'next/link'

import { MemberAvatar } from '@/components/member-avatar'
import type { Member } from '@/data/members'

export function MemberCard({ member, index }: { member: Member; index: number }) {
  return (
    <li>
      <Link
        href={`/members/${member.slug}`}
        className="group block h-full overflow-hidden rounded-lg border border-sand-dark bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gold-500/60 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
          <MemberAvatar
            member={member}
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
            // First row is above the fold on most viewports.
            loading={index < 5 ? 'eager' : 'lazy'}
            initialsClassName="text-3xl sm:text-4xl"
            imageClassName="transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/70 to-transparent" />
        </div>
        <div className="p-3 text-center sm:p-4">
          <h3 className="font-serif text-base leading-snug font-semibold text-balance text-navy-900 sm:text-lg">
            {member.name}
          </h3>
          {/* Only exec carry a role; everyone else shows just their name. */}
          {member.role ? (
            <p className="mt-1 font-serif text-xs leading-snug text-balance text-gold-600 sm:text-sm">
              {member.role}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  )
}
