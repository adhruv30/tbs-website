import { VOTE_LABELS, type Vote } from '@/lib/applications'

export const VOTE_STYLES: Record<Vote, string> = {
  yes: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
  no: 'bg-red-100 text-red-900 ring-red-300',
  abstain: 'bg-sand text-navy-900 ring-sand-dark',
}

export function VoteBadge({ vote }: { vote: Vote | null | undefined }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        vote ? VOTE_STYLES[vote] : 'bg-white text-navy-900/60 ring-navy-900/15'
      }`}
    >
      {vote ? VOTE_LABELS[vote] : 'Not voted'}
    </span>
  )
}
