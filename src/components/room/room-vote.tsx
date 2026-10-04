'use client'

import { castRoomVote } from '@/app/portal/room/actions'
import { VOTE_STYLES } from '@/components/portal/vote-badge'
import { VOTE_LABELS, VOTES, type Vote } from '@/lib/applications'
import type { VotingState } from '@/lib/room/types'

import { ActionError, useRoomAction } from './use-action'

const STATUS: Record<VotingState, string> = {
  idle: 'Waiting for the host to open voting…',
  open: 'Voting is open.',
  locked: 'Voting is locked.',
}

export function RoomVote({
  roomId,
  applicationId,
  voting,
  current,
}: {
  roomId: string
  applicationId: string
  voting: VotingState
  current: Vote | null
}) {
  const { run, pending, error } = useRoomAction()
  const open = voting === 'open'

  return (
    <section className="rounded-lg border border-sand-dark bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Your vote</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            open ? 'bg-emerald-100 text-emerald-900' : 'bg-sand text-navy-900/70'
          }`}
        >
          {open ? 'Open' : voting === 'locked' ? 'Locked' : 'Not open yet'}
        </span>
      </div>
      <p className="mt-1 text-sm text-navy-900/65">
        {STATUS[voting]}
        {current && ` You voted ${VOTE_LABELS[current].toLowerCase()}.`}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {VOTES.map((vote) => {
          const selected = current === vote
          return (
            <button
              key={vote}
              type="button"
              disabled={!open || pending}
              aria-pressed={selected}
              onClick={() => run(() => castRoomVote(roomId, applicationId, vote))}
              className={`rounded-md px-3 py-3 font-semibold ring-1 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? `${VOTE_STYLES[vote]} ring-2`
                  : 'bg-parchment text-navy-900 ring-sand-dark enabled:hover:bg-sand'
              }`}
            >
              {VOTE_LABELS[vote]}
            </button>
          )
        })}
      </div>
      <ActionError error={error} />
    </section>
  )
}
