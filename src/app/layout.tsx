import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'

import { SiteFooter } from '@/components/site-footer'
import { SiteNav } from '@/components/site-nav'
import { defaultOgImage, site } from '@/data/site'
import './globals.css'

// The whole site is set in Playfair: headings and body alike.
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    siteName: site.name,
    type: 'website',
    /*
     * Declaring an image is all a large card needs: Next infers
     * `twitter:card: summary_large_image` from it, which is how the member
     * profiles get theirs. An explicit `twitter` block would be inherited by
     * those pages and would override the headshot each of them derives.
     */
    images: [defaultOgImage],
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} h-full scroll-smooth`}
    >
      <body className="flex min-h-full flex-col bg-parchment font-serif text-navy-900">
        {/* Scroll-reveal starts hidden; without JS it must never stay that way. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
