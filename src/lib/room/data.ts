import 'server-only'

import { cache } from 'react'

import type { Vote } from '@/lib/applications'
import { isMockBackend } from '@/lib/backend-mode'
import { readMockDb } from '@/lib/mock/store'
import { createClient } from '@/lib/supabase/server'

import type { Ballot, Participant, ParticipantStatus, Room, VotingState } from './types'

type RoomRow = {
  id: string
  name: string
  current_application_id: string | null
  voting: VotingState
  created_at: string
}

const toRoom = (r: RoomRow): Room => ({
  id: r.id,
  name: r.name,
  currentApplicationId: r.current_application_id,
  voting: r.voting,
  createdAt: r.created_at,
})

/** The room currently running, if any. There is at most one. */
export const getLiveRoom = cache(async (): Promise<Room | null> => {
  if (isMockBackend()) {
    const room = readMockDb().rooms.find((r) => r.status === 'live')
    return room ? toRoom(room) : null
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('review_rooms')
    .select('id, name, current_application_id, voting, created_at')
    .eq('status', 'live')
    .maybeSingle<RoomRow>()
  return data ? toRoom(data) : null
})

export async function getMyParticipation(
  roomId: string,
  memberId: string,
): Promise<ParticipantStatus | null> {
  if (isMockBackend()) {
    return (
      readMockDb().participants.find((p) => p.room_id === roomId && p.member_id === memberId)
        ?.status ?? null
    )
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('room_participants')
    .select('status')
    .eq('room_id', roomId)
    .eq('member_id', memberId)
    .maybeSingle<{ status: ParticipantStatus }>()
  return data?.status ?? null
}

/** Everyone who has asked to join, oldest request first. Admins only (RLS). */
export async function listParticipants(roomId: string): Promise<Participant[]> {
  if (isMockBackend()) {
    const db = readMockDb()
    const names = new Map(db.members.map((m) => [m.id, m.name]))
    return db.participants
      .filter((p) => p.room_id === roomId)
      .sort((a, b) => a.requested_at.localeCompare(b.requested_at))
      .map((p) => ({
        memberId: p.member_id,
        name: names.get(p.member_id) ?? 'Unknown',
        status: p.status,
        requestedAt: p.requested_at,
      }))
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('room_participants')
    .select('member_id, status, requested_at, members!room_participants_member_id_fkey(name)')
    .eq('room_id', roomId)
    .order('requested_at')
  if (error) throw error
  return data.map((p) => ({
    memberId: p.member_id,
    name: (p.members as unknown as { name: string } | null)?.name ?? 'Unknown',
    status: p.status as ParticipantStatus,
    requestedAt: p.requested_at,
  }))
}

/**
 * Where each approved participant stands on one applicant: voted or not, and
 * how, unless `anonymize`. Counts any vote on the applicant, including from an
 * earlier room. Admins only: the caller must have passed `requireAdmin()`.
 */
export async function getBallots(
  roomId: string,
  applicationId: string,
  anonymize: boolean,
): Promise<Ballot[]> {
  const approved = (await listParticipants(roomId)).filter((p) => p.status === 'approved')

  let votes: { member_id: string; vote: Vote }[]
  if (isMockBackend()) {
    votes = readMockDb().votes.filter((v) => v.application_id === applicationId)
  } else {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('votes')
      .select('member_id, vote')
      .eq('application_id', applicationId)
    if (error) throw error
    votes = data as typeof votes
  }

  const byMember = new Map(votes.map((v) => [v.member_id, v.vote]))
  return approved
    .map((p) => {
      const vote = byMember.get(p.memberId) ?? null
      return {
        memberId: p.memberId,
        name: p.name,
        vote: vote && anonymize ? ('hidden' as const) : vote,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}
