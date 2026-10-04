import type { Vote } from '@/lib/applications'

export type VotingState = 'idle' | 'open' | 'locked'
export type ParticipantStatus = 'pending' | 'approved' | 'denied'

export type Room = {
  id: string
  name: string
  currentApplicationId: string | null
  voting: VotingState
  createdAt: string
}

export type Participant = {
  memberId: string
  name: string
  status: ParticipantStatus
  requestedAt: string
}

export type Ballot = {
  memberId: string
  name: string
  /** Hidden (`'hidden'`) when the admin has anonymized votes. */
  vote: Vote | 'hidden' | null
}

export type RoomTransport = 'supabase' | 'mock'
