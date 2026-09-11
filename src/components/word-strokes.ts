/*
 * Timing for the hand-written headings, as one unbroken stroke. The words are
 * separate elements only because each needs its own clip; the timing has to
 * hide that. So a word's reveal lasts in proportion to its length, and the next
 * starts the instant the last ends -- no beat between them. A pause at the
 * spaces would give the seams away, and there is nothing to draw there anyway.
 *
 * Shared by the home hero and the roster headers so the two are written at the
 * same speed. The sweep itself is `hero-word-write` in globals.css.
 */
const WRITE_SECONDS_PER_CHAR = 0.075

export type WordStroke = {
  word: string
  /** Seconds, for `animation-duration`. */
  duration: number
  /** Seconds from page load, for `animation-delay`. */
  delay: number
}

/**
 * `startDelay` holds the whole line back — the roster headers use it to wait
 * for their backdrop to finish settling before the first word is drawn.
 */
export function wordStrokes(title: string, startDelay = 0): WordStroke[] {
  let elapsed = startDelay
  return title.split(' ').map((word) => {
    // Rounded so the inline style is a clean number, not 0.5700000000000001s.
    const duration = Number((word.length * WRITE_SECONDS_PER_CHAR).toFixed(3))
    const delay = Number(elapsed.toFixed(3))
    elapsed += duration
    return { word, duration, delay }
  })
}
