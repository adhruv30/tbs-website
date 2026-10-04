'use client'

import { requestJoin } from '@/app/portal/room/actions'
import type { ParticipantStatus } from '@/lib/room/types'

import { ActionError, useRoomAction } from './use-action'

/** The lobby for a member who isn't in the room yet. */
export function JoinRequest({
  roomId,
  roomName,
  status,
}: {
  roomId: string
  roomName: string
  status: Exclude<ParticipantStatus, 'approved'> | null
}) {
  const { run, pending, error } = useRoomAction()

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg border border-sand-dark bg-white p-6 text-center">
      <p className="text-xs font-semibold tracking-wide text-gold-600 uppercase">Live now</p>
      <h2 className="mt-1 text-2xl font-bold">{roomName}</h2>

      {status === 'pending' ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-navy-900/75">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold-500" aria-hidden />
          Waiting for the host to let you in…
        </p>
      ) : (
        <>
          <p className="mt-3 text-navy-900/70">
            {status === 'denied'
              ? 'The host didn’t let you in this time. You can ask again.'
              : 'Ask the host to let you in. Once you’re in, you’ll vote on each applicant as they come up.'}
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => requestJoin(roomId))}
            className="mt-5 w-full rounded-md bg-navy-900 px-4 py-2.5 font-semibold text-parchment hover:bg-navy-800 disabled:opacity-60"
          >
            {pending ? 'Sending…' : status === 'denied' ? 'Ask again' : 'Request to join'}
          </button>
        </>
      )}
      <ActionError error={error} />
    </div>
  )
}
