import fs from 'node:fs'
import path from 'node:path'

import type { Metadata } from 'next'
import Image, { type StaticImageData } from 'next/image'

import { rushPage, site } from '@/data/site'

const RUSH_DIR = path.join(process.cwd(), 'public', 'rush')
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i

export const metadata: Metadata = {
  title: rushPage.heading,
  description: rushPage.description,
}

/**
 * Reads `public/rush/` at build time and resolves each flyer through a static
 * import, so dropping the design team's artwork in needs no code edit and
 * always gets a fresh content-hashed URL. Same convention as the hero and the
 * gallery strip. The page shows the first one; the rest of the panel is the FAQ.
 *
 * Extensions must be lowercase: the filter below is case-insensitive so an
 * uppercase `.PNG` off a design export still gets picked up, but Turbopack's
 * module resolution is case-sensitive and fails the build on one. Rename rather
 * than loosening this.
 *
 * The `../../../public/rush/` prefix is static on purpose: the bundler needs it
 * to know which directory to include.
 */
async function getFlyers(): Promise<StaticImageData[]> {
  let files: string[] = []
  try {
    files = fs.readdirSync(RUSH_DIR).filter((file) => IMAGE_EXTENSIONS.test(file))
  } catch {
    return []
  }
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  const flyers = await Promise.all(
    files.map(async (file) => {
      try {
        const mod = await import(`../../../public/rush/${file}`)
        return mod.default as StaticImageData
      } catch {
        return null
      }
    }),
  )
  return flyers.filter((flyer): flyer is StaticImageData => flyer !== null)
}

export default async function RushPage() {
  const flyers = await getFlyers()
  const flyer = flyers[0]
  const { faq } = rushPage
  const instagramUrl = `https://www.instagram.com/${faq.more.instagram}/`

  return (
    /*
     * Flyer left, FAQ right, together filling the viewport below the nav
     * (5rem + 1px at md and up). Black ground rather than the site's parchment:
     * the flyer is black-backed edge to edge, so the letterboxing `contain`
     * leaves over reads as part of the artwork instead of as empty page.
     *
     * Below md the two stack and the section grows normally -- half a phone
     * width is not enough to read either the flyer or the answers.
     */
    <section className="bg-black text-parchment">
      <div className="flex min-h-[calc(100svh-4rem-1px)] flex-col sm:min-h-[calc(100svh-5rem-1px)] md:h-[calc(100svh-5rem-1px)] md:min-h-0 md:flex-row">
        {/* The flyer carries its own copy, so the page heading is for screen
            readers and the tab title only. */}
        <h1 className="sr-only">{rushPage.heading}</h1>

        {flyer ? (
          <Image
            src={flyer}
            alt={`${rushPage.heading} flyer`}
            sizes="(min-width: 768px) 42vw, 100vw"
            priority
            className="h-auto w-full object-contain md:h-full md:w-[42%] md:shrink-0 md:object-left"
          />
        ) : (
          // Awaiting artwork -- a blank column would read as broken.
          <p className="m-6 rounded-lg border border-dashed border-parchment/25 px-6 py-20 text-center text-parchment/70 md:w-[42%] md:shrink-0">
            {rushPage.emptyNote}
          </p>
        )}

        {/*
         * Sized off viewport height, since height is what has to stay inside
         * the flyer's. The clamps keep it readable on a short laptop without
         * overflowing; `overflow-y-auto` is the backstop if a future answer
         * pushes past the bottom.
         */}
        <div className="min-w-0 flex-1 px-6 py-10 sm:px-10 md:h-full md:overflow-y-auto md:py-[clamp(1rem,4vh,3rem)]">
          <h2 className="text-[clamp(1.15rem,3vh,1.9rem)] leading-tight font-semibold tracking-tight text-gold-400">
            {faq.heading}
          </h2>

          <dl className="mt-[clamp(0.6rem,1.8vh,1.4rem)] divide-y divide-parchment/10">
            {faq.items.map((item) => (
              <div
                key={item.question}
                className="py-[clamp(0.35rem,1.1vh,0.8rem)]"
              >
                <dt className="text-[clamp(0.72rem,1.6vh,0.95rem)] leading-snug font-semibold text-parchment">
                  {item.question}
                </dt>
                <dd className="mt-[0.2em] text-[clamp(0.68rem,1.45vh,0.875rem)] leading-snug text-parchment/70">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-[clamp(0.6rem,1.8vh,1.4rem)]">
            <h3 className="text-[clamp(0.78rem,1.7vh,1.05rem)] leading-snug font-semibold text-gold-400">
              {faq.more.heading}
            </h3>
            <p className="mt-[0.2em] text-[clamp(0.68rem,1.45vh,0.875rem)] leading-snug text-parchment/70">
              {faq.more.before}
              <a
                href={`mailto:${site.email}`}
                className="text-parchment underline decoration-parchment/30 underline-offset-2 transition-colors hover:text-gold-400 hover:decoration-gold-400"
              >
                {site.email}
              </a>
              {faq.more.between}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-parchment underline decoration-parchment/30 underline-offset-2 transition-colors hover:text-gold-400 hover:decoration-gold-400"
              >
                @{faq.more.instagram}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
