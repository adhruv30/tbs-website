import fs from 'node:fs'
import path from 'node:path'

import Image from 'next/image'

const MEMORIES_DIR = path.join(process.cwd(), 'public', 'memories')
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

/**
 * Read at build time — adding photos to `public/memories/` needs a rebuild to
 * show up, which is the tradeoff for keeping the page fully static.
 */
function readMemories(): string[] {
  try {
    return fs
      .readdirSync(MEMORIES_DIR)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort()
  } catch {
    // Folder does not exist yet.
    return []
  }
}

export function MemoriesGrid({ emptyNote }: { emptyNote: string }) {
  const photos = readMemories()

  if (photos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-sand-dark bg-white/60 px-6 py-10 text-center text-sm text-navy-700/70">
        {emptyNote}
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {photos.map((file, index) => (
        <li
          key={file}
          className="relative aspect-square overflow-hidden rounded-lg bg-navy-900"
        >
          <Image
            src={`/memories/${file}`}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            loading={index < 4 ? 'eager' : 'lazy'}
            className="object-cover transition-transform duration-500 hover:scale-[1.04] motion-reduce:transition-none"
          />
        </li>
      ))}
    </ul>
  )
}
