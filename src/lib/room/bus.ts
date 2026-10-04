import 'server-only'

import { EventEmitter } from 'node:events'

/**
 * The mock backend's stand-in for Supabase Realtime: an in-process event bus
 * that the SSE route (`src/app/api/room/events`) relays to browsers. Kept on
 * `globalThis` so hot reloads in `next dev` don't strand open connections on
 * an old copy.
 */
export type RoomEventKind = 'room' | 'participants' | 'votes' | 'presence'

export type PresenceMember = { memberId: string; name: string }

type Bus = {
  emitter: EventEmitter
  /** room id -> connection id -> who's connected. */
  presence: Map<string, Map<string, PresenceMember>>
}

const globalBus = globalThis as typeof globalThis & { __tbsRoomBus?: Bus }

function bus(): Bus {
  globalBus.__tbsRoomBus ??= {
    emitter: new EventEmitter().setMaxListeners(0),
    presence: new Map(),
  }
  return globalBus.__tbsRoomBus
}

export function emitRoomEvent(kind: RoomEventKind) {
  bus().emitter.emit('event', kind)
}

export function onRoomEvent(listener: (kind: RoomEventKind) => void) {
  bus().emitter.on('event', listener)
  return () => {
    bus().emitter.off('event', listener)
  }
}

/** Distinct members connected to a room (one person may have several tabs). */
export function presenceOf(roomId: string): PresenceMember[] {
  const seen = new Map<string, PresenceMember>()
  for (const member of bus().presence.get(roomId)?.values() ?? []) {
    seen.set(member.memberId, member)
  }
  return [...seen.values()]
}

export function joinPresence(roomId: string, connectionId: string, member: PresenceMember) {
  const room = bus().presence.get(roomId) ?? new Map()
  room.set(connectionId, member)
  bus().presence.set(roomId, room)
  emitRoomEvent('presence')
}

export function leavePresence(roomId: string, connectionId: string) {
  bus().presence.get(roomId)?.delete(connectionId)
  emitRoomEvent('presence')
}
