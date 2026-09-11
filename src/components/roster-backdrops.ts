import fs from 'node:fs'
import path from 'node:path'

import type { StaticImageData } from 'next/image'

import type { RosterKey } from '@/data/rosters'

const BACKDROPS_DIR = path.join(process.cwd(), 'public', 'backdrops')
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i

/** 'exec' -> 'execbackdrop', 'members' -> 'membersbackdrop' */
function backdropName(roster: RosterKey): string {
  return `${roster}backdrop`
}

/**
 * The header photo for a roster, taken from `public/backdrops/` by filename —
 * `membersBackdrop.*` or `execBackdrop.*` — regardless of extension or case.
 * Dropping a file in with that name is the whole wiring; there is nothing to
 * edit here.
 *
 * Resolved through a static import so the URL is content-hashed: replacing a
 * backdrop changes its URL, so no browser can serve the old one from cache.
 * The `../../public/backdrops/` prefix is static on purpose — the bundler
 * needs it to know which directory to include.
 *
 * `null` when the folder or the file is missing, which the header band renders
 * as its plain navy ground rather than a gap.
 */
export async function getRosterBackdrop(
  roster: RosterKey,
): Promise<StaticImageData | null> {
  let files: string[] = []
  try {
    files = fs.readdirSync(BACKDROPS_DIR).filter((file) => IMAGE_EXTENSIONS.test(file))
  } catch {
    // folder not created yet
    return null
  }

  const wanted = backdropName(roster)
  const match = files.find(
    (file) => file.replace(IMAGE_EXTENSIONS, '').toLowerCase() === wanted,
  )
  if (!match) return null

  try {
    const mod = await import(`../../public/backdrops/${match}`)
    return mod.default as StaticImageData
  } catch {
    return null
  }
}
