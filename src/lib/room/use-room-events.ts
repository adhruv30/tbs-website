'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { createClient } from '@/lib/supabase/browser'

import type { RoomTransport } from './types'

export type OnlineMember = { memberId: string; name: string }

/**
 * Keeps a room page live. Any change to the room, its requests or its votes
 * re-renders the page from the server (debounced), so the server stays the
 * single source of what each person may see. `presence`, when given, also
 * announces this member as online and returns who else is.
 *
 * Supabase: Postgres Changes (filtered by RLS, so members only hear about
 * their own rows) plus Presence on the private `room:<id>` channel.
 * Mock: the `/api/room/events` SSE stream.
 */
export function useRoomEvents({
  transport,
  roomId,
  presence,
}: {
  transport: RoomTransport
  roomId: string | null
  presence?: OnlineMember
}): OnlineMember[] {
  const router = useRouter()
  const [online, setOnline] = useState<OnlineMember[]>([])
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const memberId = presence?.memberId
  const name = presence?.name

  useEffect(() => {
    const refresh = () => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => router.refresh(), 150)
    }
    const track = roomId && memberId && name ? { memberId, name } : null

    if (transport === 'mock') {
      const url = track ? `/api/room/events?room=${roomId}` : '/api/room/events'
      const source = new EventSource(url)
      source.onmessage = (event) => {
        const data = JSON.parse(event.data) as { kind: string; online?: OnlineMember[] }
        if (data.kind === 'presence') setOnline(data.online ?? [])
        else if (data.kind !== 'hello') refresh()
      }
      return () => {
        source.close()
        clearTimeout(timer.current)
      }
    }

    const supabase = createClient()
    const channels: ReturnType<typeof supabase.channel>[] = []
    let cancelled = false

    void (async () => {
      // Realtime checks RLS as the signed-in member, so hand it their token.
      await supabase.realtime.setAuth()
      if (cancelled) return

      const changes = supabase
        .channel(`room-changes:${roomId ?? 'lobby'}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'review_rooms' }, refresh)
      if (roomId) {
        const filter = `room_id=eq.${roomId}`
        changes
          .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants', filter }, refresh)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter }, refresh)
      }
      channels.push(changes.subscribe())

      if (track) {
        const room = supabase.channel(`room:${roomId}`, {
          config: { private: true, presence: { key: track.memberId } },
        })
        room
          .on('presence', { event: 'sync' }, () => {
            const state = room.presenceState<OnlineMember>()
            setOnline(Object.values(state).map((entries) => entries[0]))
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') void room.track(track)
          })
        channels.push(room)
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timer.current)
      for (const channel of channels) void supabase.removeChannel(channel)
    }
  }, [transport, roomId, memberId, name, router])

  return online
}
