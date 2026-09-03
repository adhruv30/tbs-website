import Image, { type StaticImageData } from 'next/image'

import { initialsOf, type Member } from '@/data/members'

const PHOTO_PREFIX = '/members/'

/**
 * Resolve a `/members/<file>` path to a statically-imported asset so the URL is
 * content-hashed. Swapping a photo then changes its URL, and no browser can
 * serve a stale cached copy. Falls back to the raw path if the file cannot be
 * imported (e.g. a photo stored somewhere other than public/members).
 *
 * The `../../public/members/` prefix is static on purpose: the bundler needs it
 * to know which directory to include, and it stops the slug reaching outside.
 */
async function resolvePhoto(photo: string): Promise<StaticImageData | string> {
  if (!photo.startsWith(PHOTO_PREFIX)) return photo
  const filename = photo.slice(PHOTO_PREFIX.length)
  try {
    const mod = await import(`../../public/members/${filename}`)
    return mod.default as StaticImageData
  } catch {
    return photo
  }
}

/**
 * Fills its (positioned) parent. Falls back to a brand-colored initials tile
 * when a member has no photo yet.
 */
export async function MemberAvatar({
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

  const src = await resolvePhoto(member.photo)

  return (
    <Image
      src={src}
      alt={`Portrait of ${member.name}`}
      fill
      sizes={sizes}
      preload={preload}
      loading={loading}
      className={`object-cover ${imageClassName}`}
    />
  )
}
