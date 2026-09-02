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
  linkedin: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M6.94 8.4H4.06V20h2.88V8.4ZM5.5 3.9a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM20 13.6c0-3.2-1.72-4.7-4-4.7a3.45 3.45 0 0 0-3.13 1.73H12.8V8.4H9.94c.04.83 0 11.6 0 11.6h2.87v-6.48a2 2 0 0 1 .1-.7 1.57 1.57 0 0 1 1.47-1.05c1.04 0 1.46.79 1.46 1.95V20H20Z" />
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
