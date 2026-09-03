import fs from 'node:fs'
import path from 'node:path'

import type { StaticImageData } from 'next/image'

const VALUES_DIR = path.join(process.cwd(), 'public', 'values')
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i

/** "Professionalism" -> "professionalismBackdrop" */
export function backdropName(title: string): string {
  return `${title.toLowerCase().replace(/[^a-z0-9]/g, '')}Backdrop`
}

/**
 * Maps each value title to its backdrop in `public/values/`, matched by
 * filename (professionalismBackdrop.*) regardless of extension, and resolved
 * through a static import so the URL is content-hashed. Dropping a replacement
 * in with the same name changes the URL, so no stale cache and no code edit.
 *
 * The `../../public/values/` prefix is static on purpose: the bundler needs it
 * to know which directory to include.
 */
export async function getValueBackdrops(
  titles: string[],
): Promise<Record<string, StaticImageData | null>> {
  let files: string[] = []
  try {
    files = fs.readdirSync(VALUES_DIR).filter((file) => IMAGE_EXTENSIONS.test(file))
  } catch {
    // folder not created yet
  }

  const entries = await Promise.all(
    titles.map(async (title) => {
      const wanted = backdropName(title).toLowerCase()
      const match = files.find(
        (file) => file.replace(IMAGE_EXTENSIONS, '').toLowerCase() === wanted,
      )
      if (!match) return [title, null] as const
      try {
        const mod = await import(`../../public/values/${match}`)
        return [title, mod.default as StaticImageData] as const
      } catch {
        return [title, null] as const
      }
    }),
  )

  return Object.fromEntries(entries)
}
