'use client'

import Image, { type StaticImageData } from 'next/image'
import { useState } from 'react'

import type { Value } from '@/data/site'

export function ValuesSection({
  heading,
  items,
  backdrops,
}: {
  heading: string
  items: Value[]
  backdrops: Record<string, StaticImageData | null>
}) {
  const [index, setIndex] = useState(0)
  const count = items.length

  // Wraps in both directions so the arrows never dead-end.
  const go = (next: number) => setIndex(((next % count) + count) % count)

  const arrowClass =
    'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-parchment/25 bg-navy-950/40 text-parchment backdrop-blur-sm transition-colors hover:border-parchment hover:bg-parchment hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment'

  return (
    <section className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-20">
      {/* Backdrops fill the whole section and crossfade with the active value. */}
      {items.map((item, slide) => {
        const backdrop = backdrops[item.title]
        if (!backdrop) return null
        return (
          <Image
            key={item.title}
            src={backdrop}
            alt=""
            fill
            sizes="100vw"
            priority={slide === 0}
            className={`-z-10 object-cover transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
              slide === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )
      })}
      {/* Scrim: keeps the copy legible over any photograph. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-navy-950/70" />

      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={heading}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            go(index + 1)
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            go(index - 1)
          }
        }}
        className="mx-auto w-full max-w-6xl px-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-parchment sm:px-8"
      >
        <h2 className="text-center font-serif text-3xl leading-tight font-semibold tracking-tight text-balance text-parchment sm:text-5xl">
          {heading}
        </h2>

        <div className="relative mt-10 sm:mt-12">
          {/* Padding keeps the slide clear of the arrows parked at each end. */}
          <div className="overflow-hidden px-12 sm:px-16">
            <div
              className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {items.map((item, slide) => (
                <div
                  key={item.title}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${slide + 1} of ${count}: ${item.title}`}
                  aria-hidden={slide !== index}
                  className="w-full shrink-0"
                >
                  <div className="mx-auto flex min-h-[9rem] max-w-2xl flex-col items-center justify-center text-center sm:min-h-[10rem]">
                    <h3 className="font-serif text-2xl leading-snug font-semibold text-parchment sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-parchment/85 text-pretty sm:text-lg">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous value"
            className={`${arrowClass} left-0`}
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
              <path
                d="M15 5 8 12l7 7"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next value"
            className={`${arrowClass} right-0`}
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
              <path
                d="m9 5 7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <ul className="mt-8 flex items-center justify-center gap-2.5">
          {items.map((item, slide) => (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => go(slide)}
                aria-label={`Show ${item.title}`}
                aria-current={slide === index}
                className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-parchment motion-reduce:transition-none ${
                  slide === index
                    ? 'w-7 bg-gold-500'
                    : 'w-2.5 bg-parchment/30 hover:bg-parchment/60'
                }`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
