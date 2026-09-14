/*
 * Timing for the hand-written headings, as one unbroken stroke. The words are
 * separate elements only because each needs its own clip; the timing has to
 * hide that. So a word's reveal lasts in proportion to its length, and the next
 * starts the instant the last ends -- no beat between them. A pause at the
 * spaces would give the seams away, and there is nothing to draw there anyway.
 *
 * Shared by the home hero and the roster headers so the two are written at the
 * same speed. The sweep itself is `hero-word-write` in globals.css.
 *
 * Two speeds, because the lines have two jobs. A heading is the thing being
 * watched, so the pen can be seen moving. A supporting line underneath is read,
 * not watched, and at the heading's pace a line twice the length takes twice as
 * long -- which is how the hero ended up spending three seconds on its tagline
 * alone. So supporting copy is written at better than twice the speed: still
 * visibly drawn, over about as soon as the eye reaches the end of it.
 */
const HEADING_SECONDS_PER_CHAR = 0.055

/** Pass as `secondsPerChar` for a line that sits under a heading. */
export const SUPPORTING_SECONDS_PER_CHAR = 0.025

export type WordStroke = {
  word: string
  /** Seconds, for `animation-duration`. */
  duration: number
  /** Seconds from page load, for `animation-delay`. */
  delay: number
}

/**
 * `startDelay` holds the whole line back — the roster headers use it to wait
 * for their backdrop to finish settling before the first word is drawn, and
 * the hero tagline uses it to pick up exactly where the wordmark stopped.
 */
export function wordStrokes(
  title: string,
  startDelay = 0,
  secondsPerChar = HEADING_SECONDS_PER_CHAR,
): WordStroke[] {
  let elapsed = startDelay
  return title.split(' ').map((word) => {
    // Rounded so the inline style is a clean number, not 0.5700000000000001s.
    const duration = Number((word.length * secondsPerChar).toFixed(3))
    const delay = Number(elapsed.toFixed(3))
    elapsed += duration
    return { word, duration, delay }
  })
}
