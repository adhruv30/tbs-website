import { notFound } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { isMockBackend } from '@/lib/backend-mode'
import { getCurrentMember } from '@/lib/dal'
import { joinPresence, leavePresence, onRoomEvent, presenceOf } from '@/lib/room/bus'
import { getLiveRoom, getMyParticipation } from '@/lib/room/data'

/**
 * Mock-backend stand-in for Supabase Realtime, as Server-Sent Events. Every
 * signed-in member hears "something changed" (no data rides along, so nothing
 * leaks); hosts and approved participants passing `?room=` also count towards
 * the room's presence and receive the online list.
 */
export async function GET(request: NextRequest) {
  if (!isMockBackend()) notFound()
  const member = await getCurrentMember()
  if (!member) return new Response('Unauthorized', { status: 401 })

  const roomId = request.nextUrl.searchParams.get('room')
  const live = await getLiveRoom()
  const inRoom =
    !!roomId &&
    live?.id === roomId &&
    (member.isAdmin || (await getMyParticipation(roomId, member.id)) === 'approved')

  const connectionId = crypto.randomUUID()
  const encoder = new TextEncoder()
  let cleanup = () => {}

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          cleanup()
        }
      }

      const off = onRoomEvent((kind) => {
        if (kind === 'presence') {
          if (inRoom) send({ kind, online: presenceOf(roomId!) })
        } else {
          send({ kind })
        }
      })
      // Comment lines keep proxies from closing an idle stream.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          cleanup()
        }
      }, 20_000)

      cleanup = () => {
        cleanup = () => {}
        off()
        clearInterval(heartbeat)
        if (inRoom) leavePresence(roomId!, connectionId)
        try {
          controller.close()
        } catch {}
      }
      request.signal.addEventListener('abort', () => cleanup())

      if (inRoom) joinPresence(roomId!, connectionId, { memberId: member.id, name: member.name })
      else send({ kind: 'hello' })
    },
    cancel() {
      cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
