import Link from 'next/link'

import { ApplicantPhoto } from '@/components/portal/applicant-photo'
import { SettingsForm } from '@/components/portal/settings-form'
import { VoteBadge } from '@/components/portal/vote-badge'
import { YEAR_LABELS, type Vote } from '@/lib/applications'
import { requireMember } from '@/lib/dal'
import {
  getMyVotes,
  getSettings,
  getVoteTallies,
  listApplications,
  listVoters,
  type ApplicationListItem,
  type VoteTally,
} from '@/lib/portal'

export const metadata = { title: 'Applications' }

const EMPTY: VoteTally = { yes: 0, no: 0, abstain: 0, total: 0 }

type Row = ApplicationListItem & {
  myVote: Vote | null
  tally: VoteTally
  meets: boolean
}

type Column = {
  key: string
  label: string
  numeric?: boolean
  /** Sort value; columns without one aren't sortable. */
  value?: (row: Row) => number | string
  cell: (row: Row) => React.ReactNode
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const COMMON: Column[] = [
  {
    key: 'name',
    label: 'Applicant',
    value: (r) => r.name.toLowerCase(),
    cell: (r) => (
      <Link
        href={`/portal/applications/${r.id}`}
        className="flex items-center gap-3 font-semibold hover:text-gold-600"
      >
        <ApplicantPhoto url={r.photoUrl} name={r.name} className="h-9 w-9 shrink-0 rounded-full text-xs" />
        {r.name}
      </Link>
    ),
  },
  {
    key: 'year',
    label: 'Year',
    value: (r) => r.year ?? 0,
    cell: (r) => (r.year ? YEAR_LABELS[r.year] : '—'),
  },
  { key: 'major', label: 'Major', value: (r) => r.major.toLowerCase(), cell: (r) => r.major },
  {
    key: 'gpa',
    label: 'GPA',
    numeric: true,
    value: (r) => r.gpa ?? 0,
    cell: (r) => (r.gpa === null ? '—' : Number(r.gpa).toFixed(2)),
  },
]

const SUBMITTED: Column = {
  key: 'submitted',
  label: 'Submitted',
  value: (r) => r.created_at,
  cell: (r) => fmtDate(r.created_at),
}

const MEMBER_COLUMNS: Column[] = [
  ...COMMON,
  { key: 'grad', label: 'Graduates', cell: (r) => r.grad_term },
  SUBMITTED,
  { key: 'vote', label: 'Your vote', cell: (r) => <VoteBadge vote={r.myVote} /> },
]

function adminColumns(electorate: number, threshold: number): Column[] {
  const count = (key: 'yes' | 'no' | 'abstain', label: string): Column => ({
    key,
    label,
    numeric: true,
    value: (r) => r.tally[key],
    cell: (r) => r.tally[key],
  })
  return [
    ...COMMON,
    count('yes', 'Yes'),
    count('no', 'No'),
    count('abstain', 'Abstain'),
    {
      key: 'votes',
      label: 'Votes',
      numeric: true,
      value: (r) => r.tally.total,
      cell: (r) => `${r.tally.total}/${electorate}`,
    },
    ...(threshold > 0
      ? [
          {
            key: 'status',
            label: 'Threshold',
            value: (r: Row) => (r.meets ? 1 : 0),
            cell: (r: Row) => (
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                  r.meets
                    ? 'bg-emerald-100 text-emerald-900 ring-emerald-300'
                    : 'bg-white text-navy-900/60 ring-navy-900/15'
                }`}
              >
                {r.meets ? 'Meets' : `${threshold - r.tally.yes} short`}
              </span>
            ),
          },
        ]
      : []),
    SUBMITTED,
  ]
}

type Filter = { key: string; label: string; keep: (row: Row) => boolean }

const MEMBER_FILTERS: Filter[] = [
  { key: 'all', label: 'All', keep: () => true },
  { key: 'unvoted', label: 'Not voted', keep: (r) => !r.myVote },
  { key: 'voted', label: 'Voted', keep: (r) => !!r.myVote },
]

const ADMIN_FILTERS: Filter[] = [
  { key: 'all', label: 'All', keep: () => true },
  { key: 'meets', label: 'Meets threshold', keep: (r) => r.meets },
  { key: 'below', label: 'Below threshold', keep: (r) => !r.meets },
]

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function ApplicationsPage({ searchParams }: PageProps<'/portal'>) {
  const member = await requireMember()
  const isAdmin = member.isAdmin
  const params = await searchParams

  const [applications, myVotes, tallies, voters, settings] = await Promise.all([
    listApplications(),
    isAdmin ? null : getMyVotes(member.id),
    isAdmin ? getVoteTallies() : null,
    isAdmin ? listVoters() : null,
    isAdmin ? getSettings() : null,
  ])
  const threshold = settings?.voteThreshold ?? 0

  const rows: Row[] = applications.map((a) => {
    const tally = tallies?.get(a.id) ?? EMPTY
    return {
      ...a,
      myVote: myVotes?.get(a.id) ?? null,
      tally,
      meets: threshold > 0 && tally.yes >= threshold,
    }
  })

  const columns = isAdmin ? adminColumns(voters?.length ?? 0, threshold) : MEMBER_COLUMNS
  // Admins land on the strongest applicants first.
  const defaultSort = isAdmin ? 'yes' : 'submitted'
  const sortCol =
    columns.find((c) => c.key === one(params.sort) && c.value) ??
    columns.find((c) => c.key === defaultSort)!
  const defaultDir = sortCol.numeric || sortCol.key === 'status' ? 'desc' : 'asc'
  const dir = one(params.dir) === 'asc' || one(params.dir) === 'desc' ? one(params.dir)! : defaultDir

  const filters = isAdmin ? (threshold > 0 ? ADMIN_FILTERS : []) : MEMBER_FILTERS
  const filter = filters.find((f) => f.key === one(params.show)) ?? filters[0]

  const shown = rows.filter((r) => filter?.keep(r) ?? true)
  const value = sortCol.value!
  shown.sort((x, y) => {
    const a = value(x)
    const b = value(y)
    const cmp = a < b ? -1 : a > b ? 1 : 0
    return (dir === 'asc' ? cmp : -cmp) || x.name.localeCompare(y.name)
  })

  /** Current query with some keys replaced; `undefined` drops a key. */
  const href = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams()
    for (const [k, v] of Object.entries({ sort: one(params.sort), dir: one(params.dir), show: one(params.show), ...changes })) {
      if (v) next.set(k, v)
    }
    const qs = next.toString()
    return qs ? `/portal?${qs}` : '/portal'
  }

  const voted = rows.filter((r) => r.myVote).length
  const meeting = rows.filter((r) => r.meets).length

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="mt-1 text-navy-900/70">
            {rows.length} applicant{rows.length === 1 ? '' : 's'}
            {isAdmin
              ? threshold > 0 && ` · ${meeting} meet the threshold`
              : ` · ${rows.length - voted === 0 ? 'you’ve voted on everyone' : `${rows.length - voted} left for you to vote on`}`}
          </p>
        </div>
        {filters.length > 0 && (
          <div className="flex gap-1 rounded-md bg-sand p-1 text-sm font-semibold">
            {filters.map((f) => (
              <Link
                key={f.key}
                href={href({ show: f.key === 'all' ? undefined : f.key })}
                aria-current={filter?.key === f.key ? 'page' : undefined}
                className={`rounded px-3 py-1.5 ${
                  filter?.key === f.key ? 'bg-white shadow-sm' : 'text-navy-900/70 hover:text-navy-900'
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {isAdmin && settings && (
        <div className="mt-6">
          <SettingsForm settings={settings} />
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-sand-dark bg-white">
        <table className="w-full min-w-[48rem] text-sm">
          <thead className="bg-sand text-left">
            <tr>
              {columns.map((c) => {
                const active = c.key === sortCol.key
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={`px-4 py-2.5 font-semibold whitespace-nowrap ${c.numeric ? 'text-right' : ''}`}
                  >
                    {c.value ? (
                      <Link
                        href={href({
                          sort: c.key,
                          dir: active ? (dir === 'asc' ? 'desc' : 'asc') : undefined,
                        })}
                        className={active ? 'underline underline-offset-4' : 'hover:underline'}
                      >
                        {c.label}
                        {active && <span aria-hidden>{dir === 'asc' ? ' ↑' : ' ↓'}</span>}
                      </Link>
                    ) : (
                      c.label
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {shown.map((r) => (
              <tr key={r.id} className={r.meets ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-parchment'}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-2 ${c.numeric ? 'text-right tabular-nums' : ''} ${c.key === 'name' ? '' : 'whitespace-nowrap'}`}
                  >
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-navy-900/60">
                  {rows.length === 0 ? 'No applications yet.' : 'Nothing to show here.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
