'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Fades and lifts its children into place the first time they scroll into
 * view, then stops observing. Server components can be passed straight
 * through as `children`, so cards keep rendering on the server.
 *
 * `prefers-reduced-motion` is handled entirely in CSS, which pins `.reveal`
 * visible with no transition, so this component needs no special case for it.
 * The `.reveal` class also carries a `<noscript>` escape hatch (see layout) so
 * the page is never blank without JS.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  /** Use `li` inside a list so the markup stays valid. */
  as?: 'div' | 'li'
  /** Stagger, in ms. Capped by the caller so late rows don't crawl. */
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      // Fire a little before the element is fully on screen so the motion
      // finishes as the reader arrives rather than after.
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      className={`reveal ${shown ? 'reveal--in' : ''} ${className}`}
      style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
