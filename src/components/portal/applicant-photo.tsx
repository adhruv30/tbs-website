import { initialsOf } from '@/data/members'

/**
 * Signed Supabase URLs expire and vary per environment, so these skip
 * next/image (which would need every storage host allow-listed and would
 * cache past the URL's expiry).
 */
export function ApplicantPhoto({
  url,
  name,
  className = '',
}: {
  url: string | null
  name: string
  className?: string
}) {
  if (!url) {
    return (
      <div
        aria-hidden
        className={`flex items-center justify-center bg-navy-800 font-semibold text-parchment ${className}`}
      >
        {initialsOf(name)}
      </div>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={name} className={`object-cover ${className}`} />
}
