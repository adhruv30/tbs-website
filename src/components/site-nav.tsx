'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { SocialLinks } from '@/components/social-icons'
import { navLinks, site, socials } from '@/data/site'

export function SiteNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  // Tracked with the route it was opened on, so navigating closes it without an effect.
  const [menu, setMenu] = useState({ open: false, path: pathname })
  const menuOpen = menu.open && menu.path === pathname
  const setMenuOpen = (open: boolean) => setMenu({ open, path: pathname })

  // The home page hero sits underneath the nav, so it starts transparent there.
  const overlaysHero = pathname === '/'
  const solid = !overlaysHero || scrolled || menuOpen

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu((current) => ({ ...current, open: false }))
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        solid
          ? 'border-b border-navy-800/60 bg-navy-950/95 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8"
      >
        <Link
          href="/"
          className="group flex items-center gap-3 text-parchment"
          aria-label={`${site.name} — home`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-500/70 font-serif text-[0.7rem] font-bold tracking-[0.08em] text-gold-400 transition-colors group-hover:border-gold-400 group-hover:text-gold-300">
            {site.initials}
          </span>
          <span className="font-serif text-base leading-tight font-semibold tracking-tight sm:text-lg">
            <span className="sm:hidden">{site.shortName}</span>
            <span className="hidden sm:inline">{site.name}</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium tracking-wide text-parchment/85 transition-colors hover:text-gold-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <SocialLinks
            items={socials}
            className="flex items-center gap-4 border-l border-parchment/20 pl-7"
            linkClassName="block text-parchment/70 transition-colors hover:text-gold-400"
          />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-parchment md:hidden"
        >
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6">
            {menuOpen ? (
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen ? (
        <div
          id="mobile-menu"
          className="border-t border-navy-800/60 bg-navy-950/98 md:hidden"
        >
          <ul className="mx-auto w-full max-w-6xl px-5 py-2">
            {navLinks.map((link) => (
              <li key={link.href} className="border-b border-navy-800/50 last:border-0">
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-4 font-serif text-lg text-parchment transition-colors hover:text-gold-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <SocialLinks
            items={socials}
            className="mx-auto flex w-full max-w-6xl items-center gap-5 px-5 pt-2 pb-6"
            linkClassName="block text-parchment/70 transition-colors hover:text-gold-400"
          />
        </div>
      ) : null}
    </header>
  )
}
