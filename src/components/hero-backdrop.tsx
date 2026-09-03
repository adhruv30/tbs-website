import fs from 'node:fs'
import path from 'node:path'

import Image, { type StaticImageData } from 'next/image'

const HERO_DIR = path.join(process.cwd(), 'public', 'hero')
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i
const PREFERRED = 'herobackdrop'

/**
 * Picks the hero photo from `public/hero/`: a file named `heroBackdrop.*` if
 * present, otherwise the first image in natural order. Resolved through a
 * static import, so replacing the file (same name) gives it a new
 * content-hashed URL — no stale cache, no code edit.
 *
 * The `../../public/hero/` prefix is static on purpose: the bundler needs it to
 * know which directory to include.
 */
async function getHeroBackdrop(): Promise<StaticImageData | null> {
  let files: string[] = []
  try {
    files = fs.readdirSync(HERO_DIR).filter((file) => IMAGE_EXTENSIONS.test(file))
  } catch {
    return null
  }
  if (files.length === 0) return null

  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const chosen =
    files.find((file) => file.replace(IMAGE_EXTENSIONS, '').toLowerCase() === PREFERRED) ??
    files[0]

  try {
    const mod = await import(`../../public/hero/${chosen}`)
    return mod.default as StaticImageData
  } catch {
    return null
  }
}

export async function HeroBackdrop() {
  const backdrop = await getHeroBackdrop()

  return (
    // Decorative backdrop behind the wordmark, so it stays out of the a11y tree.
    <div className="absolute inset-0 overflow-hidden bg-navy-950" aria-hidden>
      {backdrop ? (
        <Image
          src={backdrop}
          alt=""
          fill
          sizes="100vw"
          preload
          quality={70}
          // Vertical crop split: 0% = flush to the top of the photo (pushes
          // people down into the wordmark), 50% = centred (crops the back
          // row's heads). Tune this one number if the framing needs a nudge.
          className="object-cover object-[center_25%]"
        />
      ) : null}
      {/*
        The copy is centred, so the scrim has to be even across the width.
        These two layers stack multiplicatively: ~67% top, ~61% middle,
        ~76% bottom.
      */}
      <div className="absolute inset-0 bg-navy-950/28" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/35 via-navy-950/22 to-navy-950/50" />
    </div>
  )
}
