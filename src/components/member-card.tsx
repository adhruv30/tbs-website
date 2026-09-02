import Link from 'next/link'

import { MemberAvatar } from '@/components/member-avatar'
import { classLabel, type Member } from '@/data/members'

export function MemberCard({ member, index }: { member: Member; index: number }) {
  // Null fields are dropped rather than rendered as empty text.
  const meta = [classLabel(member.year), member.major].filter(Boolean)

  return (
    <li>
      <Link
        href={`/members/${member.slug}`}
        className="group block h-full overflow-hidden rounded-lg border border-sand-dark bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gold-500/60 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
          <MemberAvatar
            member={member}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
            // First row is above the fold on most viewports.
            loading={index < 4 ? 'eager' : 'lazy'}
            initialsClassName="text-4xl sm:text-5xl"
            imageClassName="transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/70 to-transparent" />
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="font-serif text-lg leading-snug font-semibold text-navy-900">
            {member.name}
          </h3>
          {member.role ? (
            <p className="mt-1 text-sm font-medium text-gold-600">{member.role}</p>
          ) : null}
          {meta.length > 0 ? (
            <p className="mt-2 text-sm text-navy-700/70">{meta.join(' · ')}</p>
          ) : null}
        </div>
      </Link>
    </li>
  )
}
