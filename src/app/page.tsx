import Link from 'next/link'

import { CompanyGrid } from '@/components/company-grid'
import { GalleryStrip } from '@/components/gallery-strip'
import { HeroBackdrop } from '@/components/hero-backdrop'
import { MemberAvatar } from '@/components/member-avatar'
import { getValueBackdrops } from '@/components/value-backdrops'
import { ValuesSection } from '@/components/values-section'
import {
  SUPPORTING_SECONDS_PER_CHAR,
  wordStrokes,
} from '@/components/word-strokes'
import { getMember } from '@/data/members'
import {
  about,
  companies,
  hero,
  join,
  letter,
  values,
  whereWereAt,
} from '@/data/site'

export default function HomePage() {
  return (
    <>
      <Hero />
      <GalleryStrip />
      <Values />
      <WhereWereAt />
      <About />
      <PresidentLetter />
      <JoinBand />
    </>
  )
}

function Hero() {
  /*
   * One continuous hand: the wordmark is written, then the tagline picks up
   * where it stopped and is written in the same stroke. Both lines hold their
   * boxes throughout -- a clip-path reveals nothing, it does not collapse --
   * so nothing below shifts while the writing runs.
   */
  const strokes = wordStrokes(hero.title)
  const titleEnd = strokes.reduce(
    (end, stroke) => Math.max(end, stroke.delay + stroke.duration),
    0,
  )
  const taglineStrokes = wordStrokes(
    hero.tagline,
    titleEnd,
    SUPPORTING_SECONDS_PER_CHAR,
  )

  return (
    <section
      className="relative -mt-[calc(4rem+1px)] flex min-h-[min(calc(100svh_-_10rem),46rem)] items-end overflow-hidden sm:-mt-[calc(5rem+1px)]"
      aria-labelledby="hero-title"
    >
      <HeroBackdrop />

      {/*
        Sat low in the frame (items-end + this bottom padding) so the wordmark
        clears the faces and lands around the front row's midsection, with the
        buttons in the space below them.
      */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-10 text-center text-parchment sm:px-8 sm:pb-12">
        {/*
          The words are separate elements with no whitespace between them, and
          the gap is a CSS margin, so the text content reads
          "TritonBusinessSociety". The label restores the spaces for anything
          that consumes the string rather than the glyphs.
        */}
        <h1
          id="hero-title"
          aria-label={hero.title}
          className="max-w-4xl font-serif text-[2.75rem] leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          {strokes.map(({ word, duration, delay }, index) => (
            <span
              key={`${word}-${index}`}
              className="hero-word"
              style={{
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        <p className="mt-3 max-w-2xl font-serif text-lg leading-snug text-balance text-parchment/85 sm:mt-4 sm:text-xl lg:text-2xl">
          {/*
            The h1 can hang its real string on `aria-label` because a heading
            has a role for one to attach to; a <p> has none, and the label is
            dropped. So the readable copy goes in a hidden span and the drawn
            words are taken out of the a11y tree instead.
          */}
          <span className="sr-only">{hero.tagline}</span>
          <span aria-hidden>
            {taglineStrokes.map(({ word, duration, delay }, index) => (
              <span
                key={`${word}-${index}`}
                className="hero-word"
                style={{
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              >
                {word}
              </span>
            ))}
          </span>
        </p>

        <div className="mt-5 flex flex-col items-center gap-3 sm:mt-6 sm:flex-row sm:gap-4">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-navy-950 transition-colors hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="inline-flex items-center justify-center rounded-full border border-parchment/35 bg-navy-950/45 px-6 py-3 text-base font-semibold text-parchment transition-colors hover:border-parchment hover:bg-navy-950/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment"
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  )
}

async function Values() {
  const backdrops = await getValueBackdrops(values.items.map((item) => item.title))

  return (
    <ValuesSection
      heading={values.heading}
      items={values.items}
      backdrops={backdrops}
    />
  )
}

function About() {
  return (
    <section id="about" className="bg-navy-950 py-20 text-parchment sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-gold-400 uppercase">
              {about.eyebrow}
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
              {about.heading}
            </h2>
          </div>
          <div className="space-y-5">
            {about.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="text-base leading-relaxed text-parchment/75 text-pretty sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function WhereWereAt() {
  return (
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <h2 className="text-center font-serif text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          {whereWereAt.heading}
        </h2>

        <div className="mt-12 sm:mt-16">
          <CompanyGrid items={companies} />
        </div>
      </div>
    </section>
  )
}

/**
 * The page's one ask. It takes the footer's own ground and runs straight into
 * it, so the bottom of the page reads as a single closing block: the ask, then
 * the contact details, with no seam between them.
 */
function JoinBand() {
  return (
    <section id="join" className="bg-navy-950 py-16 text-parchment sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 text-center sm:px-8">
        {/* Same eyebrow device as About. */}
        <p className="text-xs font-semibold tracking-[0.22em] text-gold-400 uppercase">
          {join.eyebrow}
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          {join.heading}
        </h2>

        {/* Same pairing as the hero, so the page opens and closes on it. */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Link
            href={join.primaryCta.href}
            className="inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-navy-950 transition-colors hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            {join.primaryCta.label}
          </Link>
          <Link
            href={join.secondaryCta.href}
            className="inline-flex items-center justify-center rounded-full border border-parchment/35 px-6 py-3 text-base font-semibold text-parchment transition-colors hover:border-parchment hover:bg-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment"
          >
            {join.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  )
}

function PresidentLetter() {
  // The letter is signed by its author, who need not be the sitting President.
  const author = getMember(letter.authorSlug)

  return (
    <section className="bg-sand">
      <div className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="w-full max-w-xl lg:ml-auto">
            <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
              {letter.heading}
            </h2>

            <div className="mt-8 space-y-5">
              {letter.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="font-serif text-base leading-relaxed text-navy-800/85 text-pretty"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {author ? (
              <p className="mt-8 font-serif text-base leading-relaxed text-navy-800/85">
                {letter.signoff}
                <br />
                {author.name.split(' ')[0]}
              </p>
            ) : null}
          </div>
        </div>

        {author ? (
          <div className="relative min-h-[26rem] sm:min-h-[32rem] lg:min-h-[40rem]">
            <MemberAvatar
              member={author}
              sizes="(min-width: 1024px) 50vw, 100vw"
              initialsClassName="text-7xl"
              // Anchor to the top so the portrait's head isn't cropped out.
              imageClassName="object-top"
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
