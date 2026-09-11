'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { SocialIcon } from '@/components/social-icons'
import { contact, navLinks, socials } from '@/data/site'

/**
 * The contact block lives on the home page and nowhere else; every other page
 * gets the slim bar only. That keeps one canonical `#contact` anchor on the
 * site, which is what the nav's `/#contact` has always pointed at.
 */
function showsContact(pathname: string): boolean {
  return pathname === '/'
}

/**
 * The stack reads email-first, which is not the order the nav wants its icons
 * in, so `contact.order` drives this rather than the `socials` array itself.
 */
const contactMethods = contact.order.flatMap((icon) => {
  const social = socials.find((candidate) => candidate.icon === icon)
  return social ? [social] : []
})

export function SiteFooter() {
  const withContact = showsContact(usePathname())

  return (
    <footer
      id={withContact ? 'contact' : undefined}
      className="bg-navy-950 text-parchment"
    >
      <div
        className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${
          withContact ? 'py-12 sm:py-16' : 'py-8 sm:py-10'
        }`}
      >
        {withContact ? (
          // The right column is `auto`, so the buttons size to their own
          // content instead of stretching across half the page.
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-gold-400 uppercase">
                {contact.eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight font-semibold text-balance">
                {contact.heading}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-parchment/70">
                {contact.body}
              </p>
            </div>

            {/*
              Stretched by the column's default cross-axis alignment, so every
              button matches the widest -- the email address -- rather than
              stepping in with each shorter handle.
            */}
            <ul className="flex flex-col gap-3">
              {contactMethods.map((social) => {
                const external = social.icon !== 'email'
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noreferrer noopener' : undefined}
                      className="flex items-center gap-3 rounded-full border border-parchment/20 px-5 py-3 text-base text-parchment/85 transition-colors hover:border-gold-400 hover:text-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
                    >
                      <SocialIcon name={social.icon} className="h-5 w-5 shrink-0" />
                      {/* Both handles read the same, so name the network. */}
                      <span className="sr-only">{social.label}: </span>
                      {social.handle}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        {/* With no block above, there is nothing to rule off from. */}
        <div className={withContact ? 'mt-12 border-t border-parchment/12 pt-8' : ''}>
          {/* `sm:justify-end` keeps the row where it sat when a Login button
              held the opposite end; below sm it stays left, as it always did. */}
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 sm:justify-end">
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
