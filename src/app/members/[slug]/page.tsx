import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MemberAvatar } from '@/components/member-avatar'
import { SocialIcon } from '@/components/social-icons'
import {
  classLabel,
  cohortOf,
  getMember,
  members,
  type Member,
} from '@/data/members'

// Every profile is known at build time, so anything else is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return members.map((member) => ({ slug: member.slug }))
}

/** One-line summary built from whichever fields this member actually has. */
function describe(member: Member): string {
  return [classLabel(member.year), member.major, member.hometown]
    .filter(Boolean)
    .join(' · ')
}

function slugifyLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export async function generateMetadata(
  props: PageProps<'/members/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const member = getMember(slug)
  if (!member) return {}

  const title = member.role ? `${member.name} — ${member.role}` : member.name
  const description = describe(member)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(member.photo ? { images: [{ url: member.photo }] } : {}),
    },
  }
}

export default async function MemberProfilePage(
  props: PageProps<'/members/[slug]'>,
) {
  const { slug } = await props.params
  const member = getMember(slug)
  if (!member) notFound()

  const year = classLabel(member.year)
  const isExec = cohortOf(member) === 'exec'

  // Null / empty fields never enter these lists, so they cannot render a
  // stray label with no value.
  const facts = [
    ...(year ? [{ label: 'Class', value: year }] : []),
    ...(member.major ? [{ label: 'Major', value: member.major }] : []),
    ...(member.hometown ? [{ label: 'Hometown', value: member.hometown }] : []),
  ]

  const lists = [
    { label: 'Career interests', items: member.careerInterests },
    { label: 'Hobbies', items: member.hobbies },
  ].filter((list) => list.items.length > 0)

  return (
    <article>
      <div className="bg-navy-950 pt-10 pb-24 sm:pt-12 sm:pb-28">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <Link
            href={isExec ? '/executive-committee' : '/members'}
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
            {isExec ? 'Executive committee' : 'Active members'}
          </Link>
        </div>
      </div>

      <div className="mx-auto -mt-16 w-full max-w-6xl px-5 pb-16 sm:-mt-24 sm:px-8 sm:pb-24">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-8">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[17rem] overflow-hidden rounded-xl border border-sand-dark bg-navy-900 shadow-xl lg:sticky lg:top-28 lg:mx-0 lg:max-w-none">
            <MemberAvatar
              member={member}
              sizes="(min-width: 1024px) 368px, (min-width: 640px) 272px, 70vw"
              preload={Boolean(member.photo)}
              initialsClassName="text-6xl lg:text-7xl"
            />
          </div>

          <div className="rounded-xl border border-sand-dark bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <span className="inline-flex rounded-full bg-navy-900 px-3.5 py-1.5 text-[0.65rem] font-semibold tracking-[0.18em] text-gold-400 uppercase">
              {isExec ? 'Executive Committee' : 'Active Member'}
            </span>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
              <h1 className="font-serif text-4xl leading-[1.1] font-bold tracking-tight text-balance text-navy-900 sm:text-5xl">
                {member.name}
              </h1>
              {member.linkedin ? (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sand text-navy-800 transition-colors hover:bg-navy-900 hover:text-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
                >
                  <SocialIcon name="linkedin" className="h-5 w-5" />
                  <span className="sr-only">{member.name} on LinkedIn</span>
                </a>
              ) : null}
            </div>

            {member.role ? (
              <p className="mt-3 font-serif text-lg text-gold-600 sm:text-xl">
                {member.role}
              </p>
            ) : null}

            {/*
              A member with no details filled in yet renders as just the badge,
              name and photo — no divider rule sitting above an empty grid.
            */}
            {facts.length > 0 || lists.length > 0 ? (
            <div className="mt-8 grid gap-x-10 gap-y-8 border-t border-sand-dark pt-8 sm:grid-cols-2">
              {facts.length > 0 ? (
                <dl className="space-y-6">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-[0.7rem] font-semibold tracking-[0.18em] text-navy-700/50 uppercase">
                        {fact.label}
                      </dt>
                      <dd className="mt-1.5 text-base text-navy-900">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {lists.length > 0 ? (
                <div className="space-y-6">
                  {lists.map((list) => {
                    const id = `${slugifyLabel(list.label)}-heading`
                    return (
                      <section key={list.label} aria-labelledby={id}>
                        <h2
                          id={id}
                          className="text-[0.7rem] font-semibold tracking-[0.18em] text-navy-700/50 uppercase"
                        >
                          {list.label}
                        </h2>
                        <ul className="mt-2.5 flex flex-wrap gap-2">
                          {list.items.map((item) => (
                            <li
                              key={item}
                              className="rounded-full bg-sand px-3.5 py-1.5 text-sm text-navy-800"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )
                  })}
                </div>
              ) : null}
            </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
