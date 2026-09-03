import Link from 'next/link'

import { CompanyGrid } from '@/components/company-grid'
import { GalleryStrip } from '@/components/gallery-strip'
import { HeroBackdrop } from '@/components/hero-backdrop'
import { MemberAvatar } from '@/components/member-avatar'
import { getValueBackdrops } from '@/components/value-backdrops'
import { ValuesSection } from '@/components/values-section'
import { getPresident } from '@/data/members'
import {
  about,
  companies,
  hero,
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
    </>
  )
}

function Hero() {
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
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-16 text-center text-parchment sm:px-8 sm:pb-20">
        <h1
          id="hero-title"
          className="max-w-4xl font-serif text-[2.75rem] leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          {hero.title.split(' ').map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="hero-word mr-[0.25em]"
              style={{ animationDelay: `${index * 0.24}s` }}
            >
              {word}
            </span>
          ))}
        </h1>
        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex items-center justify-center rounded-full bg-gold-500 px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="inline-flex items-center justify-center rounded-full border border-parchment/35 bg-navy-950/45 px-7 py-3.5 text-sm font-semibold text-parchment transition-colors hover:border-parchment hover:bg-navy-950/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment"
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

        <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-parchment/12 pt-12 sm:mt-20 lg:grid-cols-4">
          {about.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-serif text-4xl font-semibold text-gold-400 sm:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 block text-sm tracking-wide text-parchment/60">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
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

function PresidentLetter() {
  const president = getPresident()

  return (
    <section className="bg-sand">
      <div className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="w-full max-w-xl lg:ml-auto">
            <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
              {letter.heading}
            </h2>

            {/* Only the letter body is a placeholder — heading and sign-off are real. */}
            <p className="mt-8 rounded-lg border border-dashed border-sand-dark bg-white/60 px-6 py-10 text-center font-serif text-sm text-navy-700/70">
              {letter.placeholder}
            </p>

            {president ? (
              <p className="mt-8 font-serif text-base leading-relaxed text-navy-800/85">
                {letter.signoff}
                <br />
                {president.name.split(' ')[0]}
              </p>
            ) : null}
          </div>
        </div>

        {president ? (
          <div className="relative min-h-[26rem] sm:min-h-[32rem] lg:min-h-[40rem]">
            <MemberAvatar
              member={president}
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
