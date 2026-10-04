'use client'

import { decideRequest } from '@/app/portal/room/actions'
import type { Participant } from '@/lib/room/types'

import { useOnline } from './room-live'
import { ActionError, useRoomAction } from './use-action'

/** Join requests to decide, and who's in the room (with live presence). */
export function ParticipantsPanel({
  roomId,
  participants,
}: {
  roomId: string
  participants: Participant[]
}) {
  const online = new Set(useOnline().map((m) => m.memberId))
  const { run, pending, error } = useRoomAction()

  const pendingRequests = participants.filter((p) => p.status === 'pending')
  const approved = participants.filter((p) => p.status === 'approved')
  const denied = participants.filter((p) => p.status === 'denied')
  const onlineCount = approved.filter((p) => online.has(p.memberId)).length

  return (
    <>
      <section className="rounded-lg border border-sand-dark bg-white p-4">
        <h2 className="flex items-center justify-between font-bold">
          Requests
          {pendingRequests.length > 0 && (
            <span className="rounded-full bg-gold-500 px-2 py-0.5 text-xs text-white">
              {pendingRequests.length}
            </span>
          )}
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="mt-2 text-sm text-navy-900/60">No one waiting.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {pendingRequests.map((p) => (
              <li key={p.memberId} className="flex items-center justify-between gap-2">
                <span className="truncate">{p.name}</span>
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => decideRequest(roomId, p.memberId, 'approved'))}
                    className="rounded bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => decideRequest(roomId, p.memberId, 'denied'))}
                    className="rounded bg-sand px-2.5 py-1 text-xs font-semibold hover:bg-sand-dark disabled:opacity-60"
                  >
                    Deny
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <ActionError error={error} />
      </section>

      <section className="rounded-lg border border-sand-dark bg-white p-4">
        <h2 className="font-bold">
          In the room{' '}
          <span className="text-sm font-normal text-navy-900/60">
            {onlineCount} online · {approved.length} let in
          </span>
        </h2>
        {approved.length === 0 ? (
          <p className="mt-2 text-sm text-navy-900/60">Nobody yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {approved.map((p) => (
              <li key={p.memberId} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${online.has(p.memberId) ? 'bg-emerald-500' : 'bg-sand-dark'}`}
                    aria-label={online.has(p.memberId) ? 'online' : 'offline'}
                  />
                  <span className="truncate">{p.name}</span>
                </span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => decideRequest(roomId, p.memberId, 'denied'))}
                  className="shrink-0 text-xs text-navy-900/50 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {denied.length > 0 && (
          <p className="mt-3 text-xs text-navy-900/50">
            Denied: {denied.map((p) => p.name).join(', ')}
          </p>
        )}
      </section>
    </>
  )
}
