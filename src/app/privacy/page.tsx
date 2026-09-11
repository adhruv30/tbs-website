import type { Metadata } from 'next'

import { Reveal } from '@/components/reveal'
import { pageOpenGraph, privacyPage, site } from '@/data/site'

export const metadata: Metadata = {
  title: privacyPage.heading,
  description: privacyPage.description,
  openGraph: pageOpenGraph(privacyPage.heading, privacyPage.description),
}

/** Body copy on parchment, matching the president's letter. */
const PROSE = 'text-base leading-relaxed text-navy-800/85 text-pretty'

export default function PrivacyPage() {
  const { removal } = privacyPage

  return (
    // A single measure of prose rather than the roster's full-bleed grid: this
    // page is read straight through, so it is capped at a comfortable line
    // length and left-aligned instead of centred.
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.22em] text-gold-600 uppercase">
            {privacyPage.eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            {privacyPage.heading}
          </h1>
          <p className="mt-4 text-sm text-navy-800/60">{privacyPage.updated}</p>
          <p className={`mt-8 ${PROSE}`}>{privacyPage.intro}</p>
        </Reveal>

        <div className="mt-14 space-y-12">
          {privacyPage.sections.map((section) => (
            <Reveal key={section.heading}>
              <section>
                <h2 className="font-serif text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
                  {section.heading}
                </h2>
                <p className={`mt-4 ${PROSE}`}>{section.body}</p>

                {section.items ? (
                  <ul className="mt-4 space-y-2 pl-5">
                    {section.items.map((item) => (
                      <li key={item} className={`list-disc ${PROSE}`}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.footnote ? (
                  <p className={`mt-4 ${PROSE}`}>{section.footnote}</p>
                ) : null}
              </section>
            </Reveal>
          ))}

          <Reveal>
            <section>
              <h2 className="font-serif text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
                {removal.heading}
              </h2>
              <p className={`mt-4 ${PROSE}`}>
                {removal.before}
                <a
                  href={`mailto:${site.email}`}
                  className="text-navy-900 underline decoration-navy-900/30 underline-offset-2 transition-colors hover:text-gold-600 hover:decoration-gold-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                >
                  {site.email}
                </a>
                {removal.after}
              </p>
            </section>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
