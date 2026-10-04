'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { VOTES, type Vote } from '@/lib/applications'
import { isMockBackend } from '@/lib/backend-mode'
import { requireAdmin, requireMember } from '@/lib/dal'
import { readMockDb, writeMockDb, type MockDb } from '@/lib/mock/store'
import { emitRoomEvent, type RoomEventKind } from '@/lib/room/bus'
import { getLiveRoom, getMyParticipation } from '@/lib/room/data'
import { createClient } from '@/lib/supabase/server'

/** `null` on success, otherwise a message for the person who clicked. */
export type RoomResult = { error: string } | null

const id = z.uuid()

/**
 * Applies a mock-backend change and tells every open room page. Supabase needs
 * no equivalent: its Postgres Changes stream announces the write itself.
 */
function mockWrite(kind: RoomEventKind, change: (db: MockDb) => void) {
  const db = readMockDb()
  change(db)
  writeMockDb(db)
  emitRoomEvent(kind)
}

function done(): RoomResult {
  revalidatePath('/portal', 'layout')
  return null
}

function failed(what: string, error: unknown): RoomResult {
  console.error(`room: ${what} failed`, error)
  return { error: `Couldn’t ${what}. Please try again.` }
}

// Host ------------------------------------------------------------------------

export async function startRoom(name: string): Promise<RoomResult> {
  const admin = await requireAdmin()
  const parsed = z.string().trim().min(1, 'Give the room a name.').max(100).safeParse(name)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  if (await getLiveRoom()) return { error: 'A room is already running.' }

  if (isMockBackend()) {
    mockWrite('room', (db) => {
      db.rooms.push({
        id: crypto.randomUUID(),
        name: parsed.data,
        status: 'live',
        current_application_id: null,
        voting: 'idle',
        created_by: admin.id,
        created_at: new Date().toISOString(),
        ended_at: null,
      })
    })
    return done()
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('review_rooms')
    .insert({ name: parsed.data, created_by: admin.id })
  // The one-live-room index catches two admins starting at once.
  if (error?.code === '23505') return { error: 'A room is already running.' }
  return error ? failed('start the room', error) : done()
}

/** Updates the live room, provided `roomId` is still it. */
async function updateRoom(
  roomId: string,
  patch: Partial<{ status: 'ended'; ended_at: string; current_application_id: string; voting: 'idle' | 'open' | 'locked' }>,
  what: string,
): Promise<RoomResult> {
  if (!id.safeParse(roomId).success) return { error: 'Unknown room.' }
  const live = await getLiveRoom()
  if (live?.id !== roomId) return { error: 'That room has ended.' }

  if (isMockBackend()) {
    mockWrite('room', (db) => {
      const room = db.rooms.find((r) => r.id === roomId)
      if (room) Object.assign(room, patch)
    })
    return done()
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('review_rooms')
    .update(patch)
    .eq('id', roomId)
    .eq('status', 'live')
  return error ? failed(what, error) : done()
}

export async function endRoom(roomId: string): Promise<RoomResult> {
  await requireAdmin()
  return updateRoom(
    roomId,
    { status: 'ended', ended_at: new Date().toISOString(), voting: 'locked' },
    'end the room',
  )
}

/** Puts an applicant on everyone's screen. Moving on closes the last vote. */
export async function showApplicant(roomId: string, applicationId: string): Promise<RoomResult> {
  await requireAdmin()
  if (!id.safeParse(applicationId).success) return { error: 'Unknown applicant.' }
  return updateRoom(
    roomId,
    { current_application_id: applicationId, voting: 'idle' },
    'show that applicant',
  )
}

export async function setVoting(roomId: string, voting: 'open' | 'locked'): Promise<RoomResult> {
  await requireAdmin()
  if (voting !== 'open' && voting !== 'locked') return { error: 'Unknown voting state.' }
  const live = await getLiveRoom()
  if (live?.id === roomId && !live.currentApplicationId) {
    return { error: 'Put an applicant on screen first.' }
  }
  return updateRoom(roomId, { voting }, voting === 'open' ? 'open voting' : 'lock voting')
}

export async function decideRequest(
  roomId: string,
  memberId: string,
  decision: 'approved' | 'denied',
): Promise<RoomResult> {
  const admin = await requireAdmin()
  if (!id.safeParse(roomId).success || !id.safeParse(memberId).success) {
    return { error: 'Unknown request.' }
  }
  if (decision !== 'approved' && decision !== 'denied') return { error: 'Unknown decision.' }

  if (isMockBackend()) {
    mockWrite('participants', (db) => {
      const p = db.participants.find((x) => x.room_id === roomId && x.member_id === memberId)
      if (p) Object.assign(p, { status: decision, decided_at: new Date().toISOString() })
    })
    return done()
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('room_participants')
    .update({ status: decision, decided_at: new Date().toISOString(), decided_by: admin.id })
    .eq('room_id', roomId)
    .eq('member_id', memberId)
  return error ? failed('update that request', error) : done()
}

// Members ---------------------------------------------------------------------

/** Ask to join, or ask again after a denial. */
export async function requestJoin(roomId: string): Promise<RoomResult> {
  const member = await requireMember()
  if (member.isAdmin) return { error: 'Admins host the room; no need to join.' }
  const live = await getLiveRoom()
  if (!live || live.id !== roomId) return { error: 'That room has ended.' }

  const current = await getMyParticipation(roomId, member.id)
  if (current === 'pending' || current === 'approved') return done()

  const now = new Date().toISOString()
  if (isMockBackend()) {
    mockWrite('participants', (db) => {
      db.participants = db.participants.filter(
        (p) => !(p.room_id === roomId && p.member_id === member.id),
      )
      db.participants.push({
        room_id: roomId,
        member_id: member.id,
        status: 'pending',
        requested_at: now,
        decided_at: null,
      })
    })
    return done()
  }

  const supabase = await createClient()
  const { error } = current
    ? await supabase
        .from('room_participants')
        .update({ status: 'pending', requested_at: now, decided_at: null, decided_by: null })
        .eq('room_id', roomId)
        .eq('member_id', member.id)
    : await supabase
        .from('room_participants')
        .insert({ room_id: roomId, member_id: member.id })
  return error ? failed('send your request', error) : done()
}

/**
 * A vote from inside the room. Mirrors the database's `can_vote()`: live room,
 * this applicant on screen, voting open, caller approved and not an admin.
 */
export async function castRoomVote(
  roomId: string,
  applicationId: string,
  vote: Vote,
): Promise<RoomResult> {
  const member = await requireMember()
  if (member.isAdmin) return { error: 'Admins don’t vote.' }
  if (!VOTES.includes(vote)) return { error: 'Invalid vote.' }

  const live = await getLiveRoom()
  if (!live || live.id !== roomId) return { error: 'That room has ended.' }
  if (live.currentApplicationId !== applicationId) {
    return { error: 'That applicant is no longer on screen.' }
  }
  if (live.voting !== 'open') return { error: 'Voting is closed.' }
  if ((await getMyParticipation(roomId, member.id)) !== 'approved') {
    return { error: 'You haven’t been let into the room.' }
  }

  const row = {
    application_id: applicationId,
    member_id: member.id,
    vote,
    room_id: roomId,
    updated_at: new Date().toISOString(),
  }

  if (isMockBackend()) {
    mockWrite('votes', (db) => {
      db.votes = db.votes.filter(
        (v) => !(v.application_id === applicationId && v.member_id === member.id),
      )
      db.votes.push(row)
    })
    return done()
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('votes')
    .upsert(row, { onConflict: 'application_id,member_id' })
  return error ? failed('save your vote', error) : done()
}
