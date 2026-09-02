'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type Slide = { src: string; alt: string }

export function HeroSlideshow({
  slides,
  intervalSeconds,
}: {
  slides: readonly Slide[]
  intervalSeconds: number
}) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return

    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      intervalSeconds * 1000,
    )
    return () => window.clearInterval(timer)
  }, [slides.length, intervalSeconds])

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-950">
      {slides.map((slide, index) => {
        const isActive = index === active
        return (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            aria-hidden={!isActive}
            fill
            sizes="100vw"
            // The first slide is the LCP element; the rest load lazily behind it.
            preload={index === 0}
            quality={70}
            className={`object-cover transition-opacity duration-[1600ms] ease-in-out motion-reduce:transition-none ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )
      })}
      {/* Scrims: keep the wordmark legible over any photograph. */}
      <div className="absolute inset-0 bg-navy-950/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/35 to-navy-950/95" />
    </div>
  )
}
