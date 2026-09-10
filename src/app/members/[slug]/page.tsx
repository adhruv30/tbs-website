import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MemberAvatar } from '@/components/member-avatar'
import { Reveal } from '@/components/reveal'
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
  // Class and hometown render under the name instead of in this grid.
  const facts = member.major ? [{ label: 'Major', value: member.major }] : []

  const lists = [
    { label: 'Career interests', items: member.careerInterests },
    { label: 'Hobbies', items: member.hobbies },
  ].filter((list) => list.items.length > 0)

  return (
    <article>
      <div className="bg-navy-950 pt-10 pb-24 sm:pt-12 sm:pb-28">
        <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
          <Link
            href={isExec ? '/executive-committee' : '/members'}
            className="group inline-flex items-center gap-2 text-sm text-parchment/60 transition-colors hover:text-gold-400"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-x-1"
            >
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

      <div className="mx-auto -mt-16 w-full max-w-5xl px-5 pb-14 sm:-mt-24 sm:px-8 sm:pb-20">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:items-stretch lg:gap-8">
          <Reveal className="relative mx-auto aspect-[4/5] w-full max-w-[17rem] overflow-hidden border border-sand-dark bg-navy-900 shadow-xl lg:mx-0 lg:aspect-auto lg:max-w-none lg:min-h-[26rem]">
            <MemberAvatar
              member={member}
              sizes="(min-width: 1024px) 368px, (min-width: 640px) 272px, 70vw"
              preload={Boolean(member.photo)}
              initialsClassName="text-6xl lg:text-7xl"
            />
          </Reveal>

          <Reveal
            delay={120}
            className="border border-sand-dark bg-white p-5 shadow-sm sm:p-7 lg:p-8"
          >
            <span className="inline-flex rounded-full bg-navy-900 px-3.5 py-1.5 text-[0.65rem] font-semibold tracking-[0.18em] text-gold-400 uppercase">
              {isExec ? 'Executive Committee' : 'Active Member'}
            </span>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
              <h1 className="font-serif text-4xl leading-[1.1] font-bold tracking-tight text-balance text-navy-950 sm:text-5xl">
                {member.name}
              </h1>
              {member.linkedin ? (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  /*
                    The mark's "in" is knocked out, so the bubble's own color
                    shows through the letters -- which means colouring the text
                    turns the bubble LinkedIn blue and leaves the "in" sand.
                  */
                  className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-sand p-2 text-navy-950 shadow-sm ring-1 ring-navy-950/5 transition duration-200 hover:-translate-y-0.5 hover:text-linkedin hover:shadow-md focus-visible:text-linkedin focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
                >
                  <SocialIcon name="linkedin" className="h-7 w-7" />
                  <span className="sr-only">LinkedIn profile for {member.name}</span>
                </a>
              ) : null}
            </div>

            {member.role ? (
              <p className="mt-2 font-serif text-lg text-gold-600 sm:text-xl">
                {member.role}
              </p>
            ) : null}

            {year || member.hometown ? (
              <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm text-navy-950 sm:text-base">
                {year ? <span>{year}</span> : null}
                {member.hometown ? (
                  <span className="inline-flex items-center gap-1.5">
                    {/*
                      viewBox is cropped to the pin's own bounds (incl. stroke)
                      so the icon box doesn't add invisible padding before the
                      place name.
                    */}
                    <svg
                      viewBox="4.6 3.2 14.8 18.6"
                      aria-hidden
                      className="h-4 w-3.5 shrink-0 text-gold-600"
                    >
                      <path
                        d="M12 21s6.5-5.4 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.6 12 21 12 21Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="none"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="10.2"
                        r="2.4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="none"
                      />
                    </svg>
                    {member.hometown}
                  </span>
                ) : null}
              </div>
            ) : null}

            {/*
              A member with no details filled in yet renders as just the badge,
              name and photo — no divider rule sitting above an empty grid.
            */}
            {facts.length > 0 || lists.length > 0 ? (
            <div className="mt-6 border-t border-sand-dark pt-6">
              {facts.length > 0 ? (
                <dl className="space-y-4">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-xs font-extrabold tracking-[0.12em] text-navy-950 uppercase">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-base text-navy-900">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {lists.length > 0 ? (
                <div
                  className={`grid gap-x-8 gap-y-6 sm:grid-cols-2 ${
                    facts.length > 0 ? 'mt-6' : ''
                  }`}
                >
                  {lists.map((list) => {
                    const id = `${slugifyLabel(list.label)}-heading`
                    return (
                      <section key={list.label} aria-labelledby={id}>
                        <h2
                          id={id}
                          className="text-xs font-extrabold tracking-[0.12em] text-navy-950 uppercase"
                        >
                          {list.label}
                        </h2>
                        <p className="mt-1.5 text-base text-navy-900">
                          {list.items.join(', ')}
                        </p>
                      </section>
                    )
                  })}
                </div>
              ) : null}
            </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </article>
  )
}
