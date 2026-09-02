import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getMember, members } from '@/data/members'

// Every profile is known at build time, so anything else is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return members.map((member) => ({ slug: member.slug }))
}

export async function generateMetadata(
  props: PageProps<'/members/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const member = getMember(slug)
  if (!member) return {}

  return {
    title: `${member.name} — ${member.role}`,
    description: member.bio,
    openGraph: {
      title: `${member.name} — ${member.role}`,
      description: member.bio,
      images: [{ url: member.photo }],
    },
  }
}

export default async function MemberProfilePage(
  props: PageProps<'/members/[slug]'>,
) {
  const { slug } = await props.params
  const member = getMember(slug)
  if (!member) notFound()

  return (
    <article className="pb-20 sm:pb-28">
      <div className="bg-navy-950 pt-24 pb-32 sm:pt-28 sm:pb-40">
        <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 text-sm text-parchment/60 transition-colors hover:text-gold-400"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
              <path
                d="M15 5 8 12l7 7"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All members
          </Link>
        </div>
      </div>

      <div className="mx-auto -mt-24 w-full max-w-4xl px-5 sm:-mt-32 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-end sm:gap-10">
          <div className="relative aspect-[4/5] w-full max-w-[15rem] overflow-hidden rounded-lg border border-sand-dark bg-navy-900 shadow-lg">
            <Image
              src={member.photo}
              alt={`Portrait of ${member.name}`}
              fill
              sizes="(min-width: 640px) 240px, 90vw"
              preload
              className="object-cover"
            />
          </div>

          <div className="sm:pb-2">
            <p className="text-xs font-semibold tracking-[0.22em] text-gold-600 uppercase">
              {member.cohort === 'exec' ? 'Executive Board' : 'Active Member'}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
              {member.name}
            </h1>
            <p className="mt-3 font-serif text-lg text-navy-700 sm:text-xl">
              {member.role}
            </p>

            {member.linkedin || member.email ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {member.linkedin ? (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-full border border-navy-900/20 px-5 py-2 text-sm font-medium transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-parchment"
                  >
                    LinkedIn
                  </a>
                ) : null}
                {member.email ? (
                  <a
                    href={`mailto:${member.email}`}
                    className="rounded-full border border-navy-900/20 px-5 py-2 text-sm font-medium transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-parchment"
                  >
                    Email
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-sand-dark py-8 sm:mt-14 sm:grid-cols-3">
          {[
            { label: 'Year', value: member.year },
            { label: 'Major', value: member.major },
            { label: 'Hometown', value: member.hometown },
          ].map((field) => (
            <div key={field.label}>
              <dt className="text-xs font-semibold tracking-[0.18em] text-navy-700/50 uppercase">
                {field.label}
              </dt>
              <dd className="mt-2 text-base text-navy-900">{field.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-navy-800/85 text-pretty">
          {member.bio}
        </p>

        <div className="mt-12 grid gap-10 sm:mt-16 sm:grid-cols-2 sm:gap-12">
          <section aria-labelledby="interests-heading">
            <h2
              id="interests-heading"
              className="font-serif text-xl font-semibold text-navy-900"
            >
              Interests
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {member.interests.map((interest) => (
                <li
                  key={interest}
                  className="rounded-full bg-sand px-4 py-2 text-sm text-navy-800"
                >
                  {interest}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="fun-facts-heading">
            <h2
              id="fun-facts-heading"
              className="font-serif text-xl font-semibold text-navy-900"
            >
              Fun facts
            </h2>
            <ul className="mt-5 space-y-4">
              {member.funFacts.map((fact) => (
                <li key={fact} className="flex gap-3 text-navy-800/85">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span className="text-sm leading-relaxed sm:text-base">{fact}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  )
}
