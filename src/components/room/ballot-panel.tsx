import { VoteBadge } from '@/components/portal/vote-badge'
import { VOTE_LABELS, VOTES } from '@/lib/applications'
import type { VoteTally } from '@/lib/portal'
import type { Ballot } from '@/lib/room/types'

/** Live outcome for the applicant on screen: tallies, threshold, and who has voted. */
export function BallotPanel({
  ballots,
  tally,
  threshold,
  anonymized,
}: {
  ballots: Ballot[]
  tally: VoteTally
  threshold: number
  anonymized: boolean
}) {
  const voted = ballots.filter((b) => b.vote)
  const waiting = ballots.filter((b) => !b.vote)

  return (
    <section className="rounded-lg border border-sand-dark bg-white p-4">
      <h2 className="font-bold">Votes</h2>
      <p className="mt-0.5 text-sm text-navy-900/65">
        {voted.length} of {ballots.length} in the room have voted
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {VOTES.map((v) => (
          <div key={v} className="rounded-md bg-parchment py-2">
            <div className="text-2xl font-bold tabular-nums">{tally[v]}</div>
            <div className="text-xs font-semibold text-navy-900/60 uppercase">{VOTE_LABELS[v]}</div>
          </div>
        ))}
      </div>

      {threshold > 0 && (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm font-semibold ${
            tally.yes >= threshold ? 'bg-emerald-100 text-emerald-900' : 'bg-parchment text-navy-900/75'
          }`}
        >
          {tally.yes >= threshold
            ? `Meets the threshold (${threshold} yes)`
            : `${threshold - tally.yes} yes short of the threshold (${threshold})`}
        </p>
      )}

      <ul className="mt-3 max-h-72 divide-y divide-sand overflow-y-auto text-sm">
        {[...voted, ...waiting].map((b) => (
          <li key={b.memberId} className="flex items-center justify-between gap-2 py-1.5">
            <span className="truncate">{b.name}</span>
            {b.vote === 'hidden' ? (
              <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-xs font-semibold text-parchment">
                Voted
              </span>
            ) : (
              <VoteBadge vote={b.vote} />
            )}
          </li>
        ))}
      </ul>
      {anonymized && (
        <p className="mt-2 text-xs text-navy-900/50">
          Anonymized: showing who has voted, not how.
        </p>
      )}
    </section>
  )
}
