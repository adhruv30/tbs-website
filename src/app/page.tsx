import Image from 'next/image'
import Link from 'next/link'

import { HeroSlideshow } from '@/components/hero-slideshow'
import { about, hero, heroImages, letter, pillars } from '@/data/site'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Pillars />
      <About />
      <PresidentLetter />
    </>
  )
}

function Hero() {
  return (
    <section
      className="relative -mt-16 flex min-h-[100svh] items-center overflow-hidden sm:-mt-20"
      aria-labelledby="hero-title"
    >
      <HeroSlideshow
        slides={heroImages}
        intervalSeconds={hero.slideDurationSeconds}
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-28 pb-24 text-parchment sm:px-8 sm:pt-32 sm:pb-28">
        <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-gold-400 uppercase sm:text-xs">
          {hero.eyebrow}
        </p>
        <h1
          id="hero-title"
          className="mt-5 max-w-4xl font-serif text-[2.75rem] leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          {hero.title}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-parchment/80 text-pretty sm:mt-7 sm:text-lg">
          {hero.subtitle}
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex items-center justify-center rounded-full bg-gold-500 px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="inline-flex items-center justify-center rounded-full border border-parchment/35 px-7 py-3.5 text-sm font-semibold text-parchment transition-colors hover:border-parchment hover:bg-parchment/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment"
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  )
}

function Pillars() {
  return (
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-gold-600 uppercase">
          {pillars.eyebrow}
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          {pillars.heading}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy-700/75 text-pretty sm:text-lg">
          {pillars.intro}
        </p>

        <ul className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {pillars.items.map((pillar, index) => (
            <li
              key={pillar.title}
              className="flex flex-col rounded-lg border border-sand-dark bg-white p-6 transition-colors hover:border-gold-500/60 sm:p-7"
            >
              <span
                aria-hidden
                className="font-serif text-sm font-semibold text-gold-500"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-serif text-xl leading-snug font-semibold text-navy-900">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-navy-700">
                {pillar.summary}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-navy-700/70">
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
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

function PresidentLetter() {
  return (
    <section className="bg-sand py-20 sm:py-28">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-gold-600 uppercase">
          {letter.eyebrow}
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          {letter.heading}
        </h2>

        <div className="mt-10 space-y-6 border-l-2 border-gold-500/40 pl-6 sm:pl-8">
          {letter.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="text-base leading-relaxed text-navy-800/85 text-pretty sm:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-4 sm:mt-12 sm:gap-5">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-navy-900 sm:h-20 sm:w-20">
            <Image
              src={letter.author.photo}
              alt={`Portrait of ${letter.author.name}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm text-navy-700/70">{letter.signoff}</p>
            <p className="mt-1 font-serif text-lg font-semibold text-navy-900">
              {letter.author.name}
            </p>
            <p className="text-sm text-gold-600">{letter.author.role}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
