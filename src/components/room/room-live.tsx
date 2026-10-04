'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { useRoomEvents, type OnlineMember } from '@/lib/room/use-room-events'
import type { RoomTransport } from '@/lib/room/types'

const OnlineContext = createContext<OnlineMember[]>([])

/** Who's connected to the room right now, from presence. */
export const useOnline = () => useContext(OnlineContext)

/**
 * Wraps a room page: subscribes to live changes (re-rendering the page from
 * the server when anything moves) and, for hosts and approved participants,
 * announces them in the room's presence.
 */
export function RoomLive({
  transport,
  roomId,
  presence,
  children,
}: {
  transport: RoomTransport
  roomId: string | null
  presence?: OnlineMember
  children: ReactNode
}) {
  const online = useRoomEvents({ transport, roomId, presence })
  return <OnlineContext.Provider value={online}>{children}</OnlineContext.Provider>
}
