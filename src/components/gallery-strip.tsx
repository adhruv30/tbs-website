import fs from 'node:fs'
import path from 'node:path'

import Image, { type StaticImageData } from 'next/image'

const GALLERY_DIR = path.join(process.cwd(), 'public', 'gallery')
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i
const PLACEHOLDER_COUNT = 8

/**
 * Reads `public/gallery/` at build time and resolves each file through a static
 * import, so adding, removing or replacing an image needs no code edit and
 * always gets a fresh content-hashed URL.
 *
 * The `../../public/gallery/` prefix is static on purpose: the bundler needs it
 * to know which directory to include.
 */
async function getGalleryImages(): Promise<StaticImageData[]> {
  let files: string[] = []
  try {
    files = fs.readdirSync(GALLERY_DIR).filter((file) => IMAGE_EXTENSIONS.test(file))
  } catch {
    return []
  }
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  const images = await Promise.all(
    files.map(async (file) => {
      try {
        const mod = await import(`../../public/gallery/${file}`)
        return mod.default as StaticImageData
      } catch {
        return null
      }
    }),
  )
  return images.filter((image): image is StaticImageData => image !== null)
}

export async function GalleryStrip() {
  const images = await getGalleryImages()
  const tileClass =
    'relative h-24 w-40 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-48'

  // One run of the belt; rendered twice so the loop is seamless.
  const run = images.length > 0 ? images : Array.from({ length: PLACEHOLDER_COUNT })

  return (
    <section
      aria-label="Chapter gallery"
      className="marquee overflow-hidden border-y border-navy-800/40 bg-navy-950 py-4 sm:py-5"
    >
      <div className="marquee-track flex w-max gap-3 sm:gap-4">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-3 sm:gap-4" aria-hidden={copy === 1}>
            {run.map((item, index) =>
              images.length > 0 ? (
                <div key={`${copy}-${index}`} className={tileClass}>
                  <Image
                    src={item as StaticImageData}
                    alt=""
                    fill
                    sizes="12rem"
                    className="object-cover"
                  />
                </div>
              ) : (
                // Awaiting photos — the belt still runs so the effect is visible.
                <div
                  key={`${copy}-${index}`}
                  className={`${tileClass} border border-dashed border-parchment/20 bg-navy-900`}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
