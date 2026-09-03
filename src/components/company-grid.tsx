import fs from 'node:fs'
import path from 'node:path'

import Image from 'next/image'

import type { Company } from '@/data/site'

/** Intrinsic aspect ratio of an SVG, from its viewBox or width/height. */
function aspectRatio(logo: string): number {
  try {
    const svg = fs
      .readFileSync(path.join(process.cwd(), 'public', logo), 'utf8')
      .slice(0, 4000)
    const viewBox = svg.match(/viewBox\s*=\s*"([-\d.eE\s,]+)"/)
    if (viewBox) {
      const parts = viewBox[1].trim().split(/[\s,]+/).map(Number)
      if (parts.length === 4 && parts[2] && parts[3]) return parts[2] / parts[3]
    }
    const width = svg.match(/\bwidth\s*=\s*"([\d.]+)/)
    const height = svg.match(/\bheight\s*=\s*"([\d.]+)/)
    if (width && height && Number(height[1])) {
      return Number(width[1]) / Number(height[1])
    }
  } catch {
    // fall through to the default below
  }
  return 3
}

/**
 * These marks range from square (Apple, Pepsi) to very wide (NBCUniversal,
 * PwC). At a fixed height the square ones render ~6x smaller in area, which is
 * what made them look undersized. Shrinking height as the logo gets wider
 * evens that out; the clamp stops anything becoming huge or unreadably thin.
 */
function logoHeight(ratio: number): number {
  return Math.round(Math.min(58, Math.max(26, 50 / Math.pow(ratio, 0.45))))
}

export function CompanyGrid({ items }: { items: Company[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-5">
      {items.map((company) => {
        const height = company.logo ? logoHeight(aspectRatio(company.logo)) : 0
        return (
          <li
            key={company.name}
            // Min height reserves room for the hover scale so nothing clips.
            className="group/logo flex min-h-[4.5rem] items-center justify-center"
          >
            {company.logo ? (
              <div className="relative w-full" style={{ height }}>
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  fill
                  sizes="(min-width: 1024px) 12vw, (min-width: 640px) 22vw, 40vw"
                  // next/image serves .svg unoptimized automatically.
                  className="object-contain transition-transform duration-300 ease-out group-hover/logo:scale-110 motion-reduce:transition-none"
                />
              </div>
            ) : (
              // No usable mark available — the name still holds its slot.
              <span className="text-center text-sm font-medium text-navy-700/70 transition-transform duration-300 ease-out group-hover/logo:scale-110 motion-reduce:transition-none">
                {company.name}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
