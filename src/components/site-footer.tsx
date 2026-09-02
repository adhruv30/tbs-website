import Link from 'next/link'

import { SocialLinks } from '@/components/social-icons'
import { contact, navLinks, site, socials } from '@/data/site'

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-navy-950 text-parchment">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-gold-400 uppercase">
              {contact.eyebrow}
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight font-semibold text-balance sm:text-4xl">
              {contact.heading}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-parchment/70">
              {contact.body}
            </p>
            <SocialLinks
              items={socials}
              className="mt-8 flex items-center gap-4"
              linkClassName="flex h-11 w-11 items-center justify-center rounded-full border border-parchment/20 text-parchment/80 transition-colors hover:border-gold-400 hover:text-gold-400"
            />
          </div>

          <dl className="grid gap-6 sm:grid-cols-2 lg:content-start">
            {contact.items.map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-semibold tracking-[0.18em] text-parchment/45 uppercase">
                  {item.label}
                </dt>
                <dd className="mt-2 text-base text-parchment/90">
                  {'href' in item && item.href ? (
                    <a
                      href={item.href}
                      className="underline decoration-gold-500/50 underline-offset-4 transition-colors hover:text-gold-400"
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-parchment/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-parchment/50">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-parchment/60 transition-colors hover:text-gold-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
