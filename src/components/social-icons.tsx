import type { Social } from '@/data/site'

type IconProps = { className?: string }

const icons: Record<Social['icon'], (props: IconProps) => React.ReactElement> = {
  instagram: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  ),
  /**
   * LinkedIn's own mark: the rounded square is filled and the "in" is knocked
   * out of it, so whatever sits behind the icon shows through the letters.
   */
  linkedin: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  email: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m4 8 6.94 4.9a2 2 0 0 0 2.12 0L20 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
}

export function SocialIcon({
  name,
  className,
}: {
  name: Social['icon']
  className?: string
}) {
  const Icon = icons[name]
  return <Icon className={className} />
}

export function SocialLinks({
  items,
  className,
  linkClassName,
}: {
  items: readonly Social[]
  className?: string
  linkClassName?: string
}) {
  return (
    <ul className={className}>
      {items.map((social) => (
        <li key={social.label}>
          <a
            href={social.href}
            target={social.icon === 'email' ? undefined : '_blank'}
            rel={social.icon === 'email' ? undefined : 'noreferrer noopener'}
            className={linkClassName}
          >
            <SocialIcon name={social.icon} className="h-5 w-5" />
            <span className="sr-only">{social.label}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
