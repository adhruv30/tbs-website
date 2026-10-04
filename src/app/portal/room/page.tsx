import { ApplicantProfile } from '@/components/portal/applicant-profile'
import { ApplicantNavigator } from '@/components/room/applicant-navigator'
import { BallotPanel } from '@/components/room/ballot-panel'
import { EndRoomButton, HostControls } from '@/components/room/host-controls'
import { JoinRequest } from '@/components/room/join-request'
import { ParticipantsPanel } from '@/components/room/participants-panel'
import { RoomLive } from '@/components/room/room-live'
import { RoomVote } from '@/components/room/room-vote'
import { StartRoomForm } from '@/components/room/start-room-form'
import { applyPage } from '@/data/site'
import { isMockBackend } from '@/lib/backend-mode'
import { requireMember, type CurrentMember } from '@/lib/dal'
import {
  getApplication,
  getMyVotes,
  getSettings,
  getVoteTallies,
  listApplications,
  listVoters,
} from '@/lib/portal'
import { getBallots, getLiveRoom, getMyParticipation, listParticipants } from '@/lib/room/data'
import type { Room, RoomTransport } from '@/lib/room/types'

export const metadata = { title: 'Live review room' }

const EMPTY_TALLY = { yes: 0, no: 0, abstain: 0, total: 0 }

export default async function RoomPage() {
  const member = await requireMember()
  const room = await getLiveRoom()
  const transport: RoomTransport = isMockBackend() ? 'mock' : 'supabase'

  if (member.isAdmin) {
    return room ? (
      <HostConsole room={room} member={member} transport={transport} />
    ) : (
      <RoomLive transport={transport} roomId={null}>
        <NoRoomForAdmin />
      </RoomLive>
    )
  }

  if (!room) {
    return (
      <RoomLive transport={transport} roomId={null}>
        <div className="mx-auto mt-10 max-w-md rounded-lg border border-dashed border-sand-dark px-6 py-14 text-center">
          <h1 className="text-2xl font-bold">No review running</h1>
          <p className="mt-2 text-navy-900/70">
            When an admin starts a review room, it’ll appear here and you can ask to join.
          </p>
        </div>
      </RoomLive>
    )
  }

  const status = await getMyParticipation(room.id, member.id)
  if (status !== 'approved') {
    return (
      <RoomLive transport={transport} roomId={room.id}>
        <JoinRequest roomId={room.id} roomName={room.name} status={status} />
      </RoomLive>
    )
  }

  return <MemberRoom room={room} member={member} transport={transport} />
}

function NoRoomForAdmin() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Live review room</h1>
      <StartRoomForm defaultName={`${applyPage.heading} review`} />
    </>
  )
}

function RoomHeader({ room, children }: { room: Room; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-red-700 uppercase">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" aria-hidden />
          Live
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{room.name}</h1>
      </div>
      {children}
    </div>
  )
}

async function MemberRoom({
  room,
  member,
  transport,
}: {
  room: Room
  member: CurrentMember
  transport: RoomTransport
}) {
  const [current, myVotes] = await Promise.all([
    room.currentApplicationId ? getApplication(room.currentApplicationId) : null,
    getMyVotes(member.id),
  ])

  return (
    <RoomLive transport={transport} roomId={room.id} presence={{ memberId: member.id, name: member.name }}>
      <RoomHeader room={room} />
      {current ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <ApplicantProfile
            application={current.application}
            photoUrl={current.photoUrl}
            resumeUrl={current.resumeUrl}
            headingLevel="h2"
          />
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <RoomVote
              roomId={room.id}
              applicationId={current.application.id}
              voting={room.voting}
              current={myVotes.get(current.application.id) ?? null}
            />
          </aside>
        </div>
      ) : (
        <p className="mt-10 rounded-lg border border-dashed border-sand-dark px-6 py-16 text-center text-navy-900/70">
          You’re in. Waiting for the host to bring up the first applicant…
        </p>
      )}
    </RoomLive>
  )
}

async function HostConsole({
  room,
  member,
  transport,
}: {
  room: Room
  member: CurrentMember
  transport: RoomTransport
}) {
  const currentId = room.currentApplicationId
  const [applications, tallies, voters, settings, participants, current] = await Promise.all([
    listApplications(),
    getVoteTallies(),
    listVoters(),
    getSettings(),
    listParticipants(room.id),
    currentId ? getApplication(currentId) : null,
  ])
  const ballots = currentId ? await getBallots(room.id, currentId, settings.anonymizeVotes) : []

  const rows = applications.map((a) => {
    const t = tallies.get(a.id) ?? EMPTY_TALLY
    return { id: a.id, name: a.name, major: a.major, yes: t.yes, no: t.no, total: t.total }
  })
  const index = rows.findIndex((r) => r.id === currentId)
  // With nothing on screen yet, "Next" starts at the top of the list.
  const previousId = index > 0 ? rows[index - 1].id : null
  const nextId = index === -1 ? (rows[0]?.id ?? null) : (rows[index + 1]?.id ?? null)

  return (
    <RoomLive transport={transport} roomId={room.id} presence={{ memberId: member.id, name: member.name }}>
      <RoomHeader room={room}>
        <EndRoomButton roomId={room.id} />
      </RoomHeader>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)_18rem]">
        <ApplicantNavigator
          roomId={room.id}
          rows={rows}
          currentId={currentId}
          electorate={voters.length}
        />

        <div className="min-w-0 space-y-6">
          <HostControls
            roomId={room.id}
            voting={room.voting}
            hasApplicant={!!current}
            previousId={previousId}
            nextId={nextId}
          />
          {current ? (
            <ApplicantProfile
              application={current.application}
              photoUrl={current.photoUrl}
              resumeUrl={current.resumeUrl}
              headingLevel="h2"
            />
          ) : (
            <p className="rounded-lg border border-dashed border-sand-dark px-6 py-16 text-center text-navy-900/70">
              Pick an applicant from the list, or press Next, to put them on everyone’s screen.
            </p>
          )}
        </div>

        <aside className="space-y-6">
          <ParticipantsPanel roomId={room.id} participants={participants} />
          {current && (
            <BallotPanel
              ballots={ballots}
              tally={tallies.get(current.application.id) ?? EMPTY_TALLY}
              threshold={settings.voteThreshold}
              anonymized={settings.anonymizeVotes}
            />
          )}
        </aside>
      </div>
    </RoomLive>
  )
}
