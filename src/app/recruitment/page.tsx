import fs from 'node:fs'
import path from 'node:path'

import type { Metadata } from 'next'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

import { pageOpenGraph, recruitmentPage, site } from '@/data/site'

const RECRUITMENT_DIR = path.join(process.cwd(), 'public', 'recruitment')
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i

export const metadata: Metadata = {
  title: recruitmentPage.heading,
  description: recruitmentPage.description,
  // Without this the card falls back to the generic site title and blurb.
  openGraph: pageOpenGraph(
    recruitmentPage.heading,
    recruitmentPage.description,
  ),
}

/**
 * Reads `public/recruitment/` at build time and resolves each flyer through
 * a static import, so dropping the design team's artwork in needs no code edit
 * and always gets a fresh content-hashed URL. Same convention as the hero and
 * the gallery strip. Every flyer is shown, side by side in filename order, so
 * prefix them with a number to set the order.
 *
 * Extensions must be lowercase: the filter below is case-insensitive so an
 * uppercase `.PNG` off a design export still gets picked up, but Turbopack's
 * module resolution is case-sensitive and fails the build on one. Rename rather
 * than loosening this.
 *
 * The `../../../public/recruitment/` prefix is static on purpose: the bundler
 * needs it to know which directory to include.
 */
async function getFlyers(): Promise<StaticImageData[]> {
  let files: string[] = []
  try {
    files = fs
      .readdirSync(RECRUITMENT_DIR)
      .filter((file) => IMAGE_EXTENSIONS.test(file))
  } catch {
    return []
  }
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  const flyers = await Promise.all(
    files.map(async (file) => {
      try {
        const mod = await import(`../../../public/recruitment/${file}`)
        return mod.default as StaticImageData
      } catch {
        return null
      }
    }),
  )
  return flyers.filter((flyer): flyer is StaticImageData => flyer !== null)
}

export default async function RecruitmentPage() {
  const flyers = await getFlyers()
  const { faq } = recruitmentPage
  const instagramUrl = `https://www.instagram.com/${faq.more.instagram}/`

  return (
    /*
     * `ink` is near-black; the nav and footer take it too on this route, so
     * the flyers sit on one continuous dark ground.
     */
    <section className="bg-ink text-white">
      {/* The flyers carry their own copy, so the page heading is for screen
          readers and the tab title only. */}
      <h1 className="sr-only">{recruitmentPage.heading}</h1>

      {flyers.length > 0 ? (
        /*
         * Edge to edge, split evenly across the viewport width. Below sm they
         * stack -- half a phone width is too small to read the schedule.
         */
        <div className="grid grid-cols-1 sm:grid-flow-col sm:auto-cols-fr">
          {flyers.map((flyer, i) => (
            <Image
              key={flyer.src}
              src={flyer}
              alt={`${recruitmentPage.heading} flyer ${i + 1}`}
              sizes={`(min-width: 640px) ${Math.round(100 / flyers.length)}vw, 100vw`}
              priority={i < 2}
              className="h-auto w-full"
            />
          ))}
        </div>
      ) : (
        // Awaiting artwork -- a blank band would read as broken.
        <p className="mx-6 my-10 rounded-lg border border-dashed border-white/30 px-6 py-20 text-center text-white/80">
          {recruitmentPage.emptyNote}
        </p>
      )}

      <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="mb-16 text-center">
          <Link
            href="/apply"
            className="inline-block rounded-md bg-gold-500 px-8 py-3 text-lg font-extrabold tracking-tight text-ink uppercase transition-colors hover:bg-gold-400"
          >
            {recruitmentPage.applyCta}
          </Link>
        </div>

        {/* Set like the flyers' own headlines: heavy, uppercase, white. */}
        <h2 className="text-center text-3xl leading-tight font-extrabold tracking-tight uppercase sm:text-4xl">
          {faq.heading}
        </h2>

        <dl className="mt-10 divide-y divide-white/20 border-y border-white/20">
          {faq.items.map((item) => (
            <div key={item.question} className="py-5">
              <dt className="text-lg leading-snug font-bold text-white">
                {item.question}
              </dt>
              <dd className="mt-2 leading-relaxed text-white/80">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 text-center">
          <h3 className="text-xl leading-snug font-extrabold tracking-tight uppercase">
            {faq.more.heading}
          </h3>
          <p className="mt-2 leading-relaxed text-white/80">
            {faq.more.before}
            <a
              href={`mailto:${site.email}`}
              className="text-white underline decoration-white/40 underline-offset-2 transition-colors hover:text-gold-300 hover:decoration-gold-300"
            >
              {site.email}
            </a>
            {faq.more.between}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-white underline decoration-white/40 underline-offset-2 transition-colors hover:text-gold-300 hover:decoration-gold-300"
            >
              @{faq.more.instagram}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
