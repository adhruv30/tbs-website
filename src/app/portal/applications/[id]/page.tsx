import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ApplicantProfile } from '@/components/portal/applicant-profile'
import { VoteBadge } from '@/components/portal/vote-badge'
import { VOTE_LABELS, VOTES, type PortalSettings, type Vote } from '@/lib/applications'
import { requireMember } from '@/lib/dal'
import { getLiveRoom } from '@/lib/room/data'
import {
  getApplication,
  getMyVotes,
  getSettings,
  getVoteBreakdown,
  listApplications,
} from '@/lib/portal'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function generateMetadata({ params }: PageProps<'/portal/applications/[id]'>) {
  const { id } = await params
  const result = UUID.test(id) ? await getApplication(id) : null
  return { title: result?.application.name ?? 'Application' }
}

export default async function ApplicationPage({ params }: PageProps<'/portal/applications/[id]'>) {
  const member = await requireMember()
  const { id } = await params
  if (!UUID.test(id)) notFound()

  const [result, myVotes, all, breakdown, settings, liveRoom] = await Promise.all([
    getApplication(id),
    member.isAdmin ? null : getMyVotes(member.id),
    listApplications(),
    member.isAdmin ? getVoteBreakdown(id) : null,
    member.isAdmin ? getSettings() : null,
    getLiveRoom(),
  ])
  if (!result) notFound()
  const { application: a, photoUrl, resumeUrl } = result

  const index = all.findIndex((x) => x.id === id)
  const previous = all[index - 1]
  const next = all[index + 1]

  return (
    <>
      <div className="flex items-center justify-between gap-4 text-sm font-semibold text-gold-600">
        <Link href="/portal" className="hover:underline">
          ← All applications
        </Link>
        <span className="flex gap-4">
          {previous && (
            <Link href={`/portal/applications/${previous.id}`} className="hover:underline">
              ‹ {previous.name}
            </Link>
          )}
          {next && (
            <Link href={`/portal/applications/${next.id}`} className="hover:underline">
              {next.name} ›
            </Link>
          )}
        </span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ApplicantProfile application={a} photoUrl={photoUrl} resumeUrl={resumeUrl} />

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {myVotes && <YourVote vote={myVotes.get(a.id) ?? null} roomIsLive={!!liveRoom} />}
          {breakdown && settings && <VoteBreakdown breakdown={breakdown} settings={settings} />}
        </aside>
      </div>
    </>
  )
}

/** Voting itself happens only in the live review room. */
function YourVote({ vote, roomIsLive }: { vote: Vote | null; roomIsLive: boolean }) {
  return (
    <section className="rounded-lg border border-sand-dark bg-white p-5">
      <h2 className="text-lg font-bold">Your vote</h2>
      <div className="mt-2">
        <VoteBadge vote={vote} />
      </div>
      <p className="mt-3 text-sm text-navy-900/65">
        Voting happens in the live review room, when the host brings this applicant up.
      </p>
      {roomIsLive && (
        <Link
          href="/portal/room"
          className="mt-3 inline-block rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-parchment hover:bg-navy-800"
        >
          Go to the live room →
        </Link>
      )}
    </section>
  )
}

function VoteBreakdown({
  breakdown,
  settings,
}: {
  breakdown: NonNullable<Awaited<ReturnType<typeof getVoteBreakdown>>>
  settings: PortalSettings
}) {
  const voted = breakdown.filter((m) => m.vote)
  const counts = Object.fromEntries(
    VOTES.map((v) => [v, breakdown.filter((m) => m.vote === v).length]),
  )
  // Voted first, grouped by vote, then the members still to vote.
  const order = { yes: 0, no: 1, abstain: 2 }
  const sorted = [...breakdown].sort(
    (x, y) => (x.vote ? order[x.vote] : 3) - (y.vote ? order[y.vote] : 3),
  )

  return (
    <section className="rounded-lg border border-sand-dark bg-white p-5">
      <h2 className="text-lg font-bold">Vote breakdown</h2>
      <p className="mt-1 text-sm text-navy-900/65">
        {voted.length} of {breakdown.length} members voted
      </p>
      {settings.voteThreshold > 0 && (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm font-semibold ${
            counts.yes >= settings.voteThreshold
              ? 'bg-emerald-100 text-emerald-900'
              : 'bg-parchment text-navy-900/75'
          }`}
        >
          {counts.yes >= settings.voteThreshold
            ? `Meets the threshold (${settings.voteThreshold} yes)`
            : `${settings.voteThreshold - counts.yes} yes short of the threshold (${settings.voteThreshold})`}
        </p>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {VOTES.map((v) => (
          <div key={v} className="rounded-md bg-parchment py-2">
            <div className="text-2xl font-bold">{counts[v]}</div>
            <div className="text-xs font-semibold text-navy-900/60 uppercase">{VOTE_LABELS[v]}</div>
          </div>
        ))}
      </div>
      {settings.anonymizeVotes ? (
        <p className="mt-4 text-sm text-navy-900/60">
          Votes are anonymized. Turn this off from the Applications page to see who voted what.
        </p>
      ) : (
        <ul className="mt-4 max-h-96 divide-y divide-sand overflow-y-auto text-sm">
          {sorted.map((m) => (
            <li key={m.memberId} className="flex items-center justify-between gap-2 py-1.5">
              <span className="truncate">{m.name}</span>
              <VoteBadge vote={m.vote} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
