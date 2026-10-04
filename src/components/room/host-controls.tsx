'use client'

import { endRoom, setVoting, showApplicant } from '@/app/portal/room/actions'
import type { VotingState } from '@/lib/room/types'

import { ActionError, useRoomAction } from './use-action'

const STATE_LABEL: Record<VotingState, string> = {
  idle: 'Voting not open',
  open: 'Voting open',
  locked: 'Voting locked',
}

/** Stage controls: voting for the applicant on screen, and stepping through. */
export function HostControls({
  roomId,
  voting,
  hasApplicant,
  previousId,
  nextId,
}: {
  roomId: string
  voting: VotingState
  hasApplicant: boolean
  previousId: string | null
  nextId: string | null
}) {
  const { run, pending, error } = useRoomAction()
  const button =
    'rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="rounded-lg border border-sand-dark bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`mr-auto inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
            voting === 'open'
              ? 'bg-emerald-100 text-emerald-900'
              : voting === 'locked'
                ? 'bg-navy-900 text-parchment'
                : 'bg-sand text-navy-900/75'
          }`}
        >
          {voting === 'open' && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" aria-hidden />}
          {STATE_LABEL[voting]}
        </span>

        <button
          type="button"
          disabled={pending || !previousId}
          onClick={() => previousId && run(() => showApplicant(roomId, previousId))}
          className={`${button} bg-sand hover:bg-sand-dark`}
        >
          ‹ Previous
        </button>
        {voting === 'open' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setVoting(roomId, 'locked'))}
            className={`${button} bg-navy-900 text-parchment hover:bg-navy-800`}
          >
            Lock voting
          </button>
        ) : (
          <button
            type="button"
            disabled={pending || !hasApplicant}
            onClick={() => run(() => setVoting(roomId, 'open'))}
            className={`${button} bg-emerald-700 text-white hover:bg-emerald-800`}
          >
            {voting === 'locked' ? 'Reopen voting' : 'Open voting'}
          </button>
        )}
        <button
          type="button"
          disabled={pending || !nextId}
          onClick={() => nextId && run(() => showApplicant(roomId, nextId))}
          className={`${button} bg-sand hover:bg-sand-dark`}
        >
          Next ›
        </button>
      </div>
      <ActionError error={error} />
    </div>
  )
}

export function EndRoomButton({ roomId }: { roomId: string }) {
  const { run, pending, error } = useRoomAction()
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm('End the room for everyone?')) run(() => endRoom(roomId))
        }}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? 'Ending…' : 'End room'}
      </button>
      <ActionError error={error} />
    </div>
  )
}
