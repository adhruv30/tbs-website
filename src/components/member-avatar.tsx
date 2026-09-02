import Image from 'next/image'

import { initialsOf, type Member } from '@/data/members'

/**
 * Fills its (positioned) parent. Falls back to a brand-colored initials tile
 * when a member has no photo yet.
 */
export function MemberAvatar({
  member,
  sizes,
  preload = false,
  loading,
  initialsClassName = 'text-3xl',
  imageClassName = '',
}: {
  member: Member
  sizes: string
  preload?: boolean
  loading?: 'eager' | 'lazy'
  initialsClassName?: string
  imageClassName?: string
}) {
  if (!member.photo) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-navy-900"
        aria-hidden
      >
        <span
          className={`font-serif font-semibold tracking-[0.06em] text-gold-400/85 ${initialsClassName}`}
        >
          {initialsOf(member.name)}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={member.photo}
      alt={`Portrait of ${member.name}`}
      fill
      sizes={sizes}
      preload={preload}
      loading={loading}
      className={`object-cover ${imageClassName}`}
    />
  )
}
