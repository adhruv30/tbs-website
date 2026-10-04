import Link from 'next/link'

import { YEAR_LABELS } from '@/lib/applications'
import { requireAdmin } from '@/lib/dal'
import { getSettings, getVoteTallies, listApplications, listVoters } from '@/lib/portal'

export const metadata = { title: 'Admin' }

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100))

/** Counts of `key(item)`, most common first. */
function countBy<T>(items: T[], key: (item: T) => string): [string, number][] {
  const counts = new Map<string, number>()
  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

export default async function AdminPage() {
  await requireAdmin()
  const [applications, tallies, voters, settings] = await Promise.all([
    listApplications(),
    getVoteTallies(),
    listVoters(),
    getSettings(),
  ])

  const electorate = voters.length
  const totals = [...tallies.values()]
  const totalVotes = totals.reduce((sum, t) => sum + t.total, 0)
  const sum = (key: 'yes' | 'no' | 'abstain') => totals.reduce((s, t) => s + t[key], 0)
  const fullyVoted = applications.filter(
    (a) => electorate > 0 && (tallies.get(a.id)?.total ?? 0) >= electorate,
  ).length
  const threshold = settings.voteThreshold
  const meeting = applications.filter(
    (a) => threshold > 0 && (tallies.get(a.id)?.yes ?? 0) >= threshold,
  ).length

  const stats: [string, string | number][] = [
    ['Applications', applications.length],
    ['Votes cast', totalVotes],
    ['Overall turnout', `${pct(totalVotes, applications.length * electorate)}%`],
    ['Fully voted', `${fullyVoted} / ${applications.length}`],
    ['Yes / No / Abstain', `${sum('yes')} / ${sum('no')} / ${sum('abstain')}`],
    ['Meet threshold', threshold > 0 ? `${meeting} (${threshold}+ yes)` : 'Not set'],
  ]

  const byYear = countBy(applications, (a) => (a.year ? YEAR_LABELS[a.year] : 'Unknown'))
  const byMajor = countBy(applications, (a) => a.major.trim())

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin summary</h1>
          <p className="mt-1 text-navy-900/70">
            {electorate} active members can vote. Admins don’t vote.
          </p>
        </div>
        <Link
          href="/portal?sort=yes"
          className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-parchment hover:bg-navy-800"
        >
          Votes per applicant →
        </Link>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-sand-dark bg-white p-5">
            <dt className="text-xs font-semibold tracking-wide text-navy-900/60 uppercase">{label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Breakdown title="By year" rows={byYear} total={applications.length} />
        <Breakdown title="By major" rows={byMajor} total={applications.length} />
      </div>
    </>
  )
}

function Breakdown({ title, rows, total }: { title: string; rows: [string, number][]; total: number }) {
  return (
    <section className="rounded-lg border border-sand-dark bg-white p-5">
      <h2 className="font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-navy-900/60">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {rows.map(([label, count]) => (
            <li key={label}>
              <div className="flex justify-between gap-2">
                <span className="truncate">{label}</span>
                <span className="tabular-nums text-navy-900/70">{count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-sand">
                <div className="h-full rounded-full bg-gold-500" style={{ width: `${pct(count, total)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
