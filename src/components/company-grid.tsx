import Image from 'next/image'

import type { Company } from '@/data/site'

export function CompanyGrid({ items }: { items: Company[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-5">
      {items.map((company) => (
        <li key={company.name} className="flex items-center justify-center">
          <div className="relative h-10 w-full sm:h-12">
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              fill
              sizes="(min-width: 1024px) 12vw, (min-width: 640px) 22vw, 40vw"
              // next/image serves .svg unoptimized automatically.
              className="object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 motion-reduce:transition-none"
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
